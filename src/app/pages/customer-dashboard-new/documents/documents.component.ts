import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { DocType, TravellerDocument, TravellerDocumentsResponse } from '../../../models/traveller-documents.model';

import { ModalComponent } from './ui/modal.component';
import { BookingDetailsResponse, MyBookingItem, Traveller } from '../../../models/booking.model';
import { CustomerBookingsService } from '../../../services/customer-bookings/customer-bookings.service';
import { CustomerDocumentsService } from '../../../services/customer-documents/customer-documents.service';

// ---- UI card type (keeps your approved UI shape) ----
type UiStatus = 'not_uploaded' | 'pending' | 'verified' | 'rejected';

type UiDocType = DocType | 'supporting'; // already included, but kept explicit

export interface DashboardDocumentUI {
  id: string;                 // UI id (unique)
  dbId?: number;              // traveller_documents.id (for delete)
  type: UiDocType;            // passport|visa|id_proof|supporting
  title: string;              // card title
  status: UiStatus;
  uploadedAt?: string;
  fileUrl?: string;
  fileName?: string;
  rejectionReason?: string;
  locked?: boolean;           // optional future use
  label?: string;             // for supporting docs: doc_label
}

type UploadTarget =
  | { kind: 'required'; docType: 'passport' | 'visa' | 'id_proof' }
  | { kind: 'supporting' };

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent implements OnInit {
  // --- page state (booking + traveller selection) ---
  isLoadingBookings = false;
  bookingsError: string | null = null;
  bookings: MyBookingItem[] = [];

  expandedBookingId: number | null = null;
  bookingDetails: BookingDetailsResponse | null = null;
  isLoadingBookingDetails = false;
  bookingDetailsError: string | null = null;

  selectedTravellerId: number | null = null;
  selectedTraveller: Traveller | null = null;

  // --- docs state ---
  docs: TravellerDocumentsResponse | null = null;
  isLoadingDocs = false;
  docsError: string | null = null;

  // --- UI docs for your grid ---
  documents: DashboardDocumentUI[] = [];

  // --- modal state (your UI) ---
  previewDoc: DashboardDocumentUI | null = null;

  uploadingId: string | null = null;           // which UI card is being uploaded
  uploadTarget: UploadTarget | null = null;    // required vs supporting
  isUploading = false;
  uploadError: string | null = null;

  // supporting doc name input (in upload modal)
  supportingLabel = '';

  // delete state
  deletingDocIds = new Set<number>();

  constructor(
    private bookingsApi: CustomerBookingsService,
    private docsApi: CustomerDocumentsService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  // -------------------------------
  //  Booking loading & selection
  // -------------------------------
  loadBookings() {
    this.isLoadingBookings = true;
    this.bookingsError = null;

    this.bookingsApi.getMyBookings().subscribe({
      next: (rows) => {
        this.bookings = (rows || []).filter(
          b => (b.payment_status === 'PAID' && b.status === 'CONFIRMED')
        );
        this.isLoadingBookings = false;
      },
      error: (err) => {
        this.bookingsError = err?.error?.message || 'Failed to load bookings';
        this.isLoadingBookings = false;
      }
    });
  }

  trackByBookingId = (_: number, b: MyBookingItem) => b.booking_id;
  trackByTravellerId = (_: number, t: Traveller) => t.id;
  trackByUiDocId = (_: number, d: DashboardDocumentUI) => d.id;

  expandBooking(bookingId: number) {
    if (this.expandedBookingId === bookingId) {
      this.resetSelection();
      return;
    }

    this.resetSelection();
    this.expandedBookingId = bookingId;

    this.isLoadingBookingDetails = true;
    this.bookingDetailsError = null;

    this.bookingsApi.getBookingDetails(bookingId).subscribe({
      next: (res: BookingDetailsResponse) => {
        this.bookingDetails = res;
        this.isLoadingBookingDetails = false;

        const first = res?.travellers?.[0];
        if (first) this.selectTraveller(first.id);
      },
      error: (err) => {
        this.bookingDetailsError = err?.error?.message || 'Failed to load booking details';
        this.isLoadingBookingDetails = false;
      }
    });
  }

  selectTraveller(travellerId: number) {
    if (!this.bookingDetails?.booking?.id) return;

    this.selectedTravellerId = travellerId;
    this.selectedTraveller =
      (this.bookingDetails.travellers || []).find(t => t.id === travellerId) || null;

    this.loadTravellerDocs(this.bookingDetails.booking.id, travellerId);
  }

  private resetSelection() {
    this.expandedBookingId = null;
    this.bookingDetails = null;
    this.isLoadingBookingDetails = false;
    this.bookingDetailsError = null;

    this.selectedTravellerId = null;
    this.selectedTraveller = null;

    this.docs = null;
    this.isLoadingDocs = false;
    this.docsError = null;

    this.documents = [];

    this.uploadingId = null;
    this.uploadTarget = null;
    this.isUploading = false;
    this.uploadError = null;
    this.supportingLabel = '';

    this.previewDoc = null;
    this.deletingDocIds.clear();
  }

  // -------------------------------
  //  Documents fetch & UI mapping
  // -------------------------------
  private loadTravellerDocs(bookingId: number, travellerId: number) {
    this.isLoadingDocs = true;
    this.docsError = null;
    this.docs = null;
    this.uploadError = null;

    this.docsApi.getTravellerDocuments(bookingId, travellerId).subscribe({
      next: (res) => {
        this.docs = res;
        this.isLoadingDocs = false;
        this.documents = this.buildUiDocs(res);
      },
      error: (err) => {
        this.docsError = err?.error?.message || 'Failed to load documents';
        this.isLoadingDocs = false;
        this.documents = [];
      }
    });
  }

  private buildUiDocs(res: TravellerDocumentsResponse): DashboardDocumentUI[] {
    const out: DashboardDocumentUI[] = [];

    // Required cards (always 3 placeholders exist because backend returns placeholders)
    out.push(this.mapRequiredCard('passport', res.required.passport));
    out.push(this.mapRequiredCard('visa', res.required.visa));
    out.push(this.mapRequiredCard('id_proof', res.required.id_proof));

    // Supporting cards (0..n)
    for (const s of (res.supporting || [])) {
      out.push(this.mapSupportingCard(s));
    }

    return out;
  }

  private mapRequiredCard(docType: 'passport'|'visa'|'id_proof', d: TravellerDocument): DashboardDocumentUI {
    return {
      id: `req-${docType}`,      // stable UI id
      dbId: d.id,
      type: docType,
      title: this.prettyTitle(docType),
      status: d.status as UiStatus,
      uploadedAt: d.uploaded_at || undefined,
      fileUrl: d.file_url || undefined,
      fileName: d.file_name || undefined,
      rejectionReason: d.rejection_reason || undefined,
      locked: d.status === 'verified', // your UX: lock after verified
    };
  }

  private mapSupportingCard(d: TravellerDocument): DashboardDocumentUI {
    const dbId = d.id!;
    return {
      id: `sup-${dbId}`,         // unique UI id based on db id
      dbId,
      type: 'supporting',
      title: d.doc_label || 'Supporting Document',
      label: d.doc_label || undefined,
      status: d.status as UiStatus,
      uploadedAt: d.uploaded_at || undefined,
      fileUrl: d.file_url || undefined,
      fileName: d.file_name || undefined,
      rejectionReason: d.rejection_reason || undefined,
      locked: d.status === 'verified',
    };
  }

  private prettyTitle(t: string) {
    if (t === 'id_proof') return 'ID Proof';
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // -------------------------------
  //  Your UI helpers (kept)
  // -------------------------------
  getDescription(doc: DashboardDocumentUI) {
    if (doc.status === 'not_uploaded') return 'Please upload requested document.';
    if (doc.status === 'verified') return 'Document verified successfully.';
    if (doc.status === 'rejected') return doc.rejectionReason || 'Document was rejected. Please re-upload.';
    return 'Waiting for admin approval.';
  }

  badgeClasses(status: DashboardDocumentUI['status']) {
    const s = status.toLowerCase();
    if (['pending'].includes(s)) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (['verified'].includes(s)) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (['rejected'].includes(s)) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }

  dotClass(status: DashboardDocumentUI['status']) {
    const s = status.toLowerCase();
    if (['pending'].includes(s)) return 'bg-blue-400';
    if (['verified'].includes(s)) return 'bg-emerald-400';
    if (['rejected'].includes(s)) return 'bg-red-400';
    return 'bg-gray-400';
  }

  iconColor(doc: DashboardDocumentUI) {
    if (doc.type === 'passport') return 'text-blue-400';
    if (doc.type === 'visa') return 'text-purple-400';
    if (doc.type === 'id_proof') return 'text-indigo-400';
    return 'text-sky-400'; // supporting
  }

  // YYYY-MM-dd (kept)
  private formatYMD(d: Date) {
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  editUntil(uploadedAt: string) {
    const d = new Date(uploadedAt);
    d.setDate(d.getDate() + 7);
    const dd = `${d.getDate()}`.padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${dd} ${months[d.getMonth()]}`;
  }

  isPdf(doc: DashboardDocumentUI) {
    return (doc.fileName || '').toLowerCase().endsWith('.pdf');
  }

  // -------------------------------
  //  Upload flow (real backend)
  // -------------------------------
  openUpload(uiId: string) {
    if (!this.expandedBookingId || !this.selectedTravellerId) {
      this.uploadError = 'Select a booking and traveller first.';
      return;
    }

    const doc = this.documents.find(d => d.id === uiId);
    if (!doc) return;

    // Lock rule: verified locked
    if (doc.locked) return;

    this.uploadingId = uiId;
    this.uploadError = null;
    this.isUploading = false;

    if (doc.type === 'supporting') {
      this.uploadTarget = { kind: 'supporting' };
      // Pre-fill label for supporting (nice UX)
      this.supportingLabel = doc.label || doc.title || '';
    } else {
      this.uploadTarget = { kind: 'required', docType: doc.type };
      this.supportingLabel = '';
    }
  }

  openPreview(doc: DashboardDocumentUI) {
    this.previewDoc = doc;
  }

  closeUpload() {
    if (!this.isUploading) {
      this.uploadingId = null;
      this.uploadTarget = null;
      this.supportingLabel = '';
      this.uploadError = null;
    }
  }

  closePreview() {
    this.previewDoc = null;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    input.value = '';
    this.onFileSelected(file);
  }

  onFileSelected(file: File | null) {
    if (!file || !this.uploadingId || !this.uploadTarget) return;
    if (!this.expandedBookingId || !this.selectedTravellerId) return;

    // 5MB guard (same as backend limit)
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      this.uploadError = 'Max file size is 5MB.';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;

    const bookingId = this.expandedBookingId;
    const travellerId = this.selectedTravellerId;

    // Optimistic UI (optional): set pending immediately on that card
    this.documents = this.documents.map(d => {
      if (d.id !== this.uploadingId) return d;
      return {
        ...d,
        status: 'pending',
        uploadedAt: this.formatYMD(new Date()),
        fileName: file.name,
      };
    });

    if (this.uploadTarget.kind === 'required') {
      const docType = this.uploadTarget.docType;

      this.docsApi.uploadRequired(bookingId, travellerId, docType, file).subscribe({
        next: () => {
          this.isUploading = false;
          this.uploadingId = null;
          this.uploadTarget = null;
          this.supportingLabel = '';
          this.loadTravellerDocs(bookingId, travellerId);
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadError = err?.error?.message || 'Upload failed';
          // refresh from server to revert optimistic
          this.loadTravellerDocs(bookingId, travellerId);
        }
      });

      return;
    }

    // supporting
    const label = (this.supportingLabel || '').trim();
    if (!label) {
      this.isUploading = false;
      this.uploadError = 'Please enter a document name (e.g. Flight Ticket).';
      return;
    }

    this.docsApi.uploadSupporting(bookingId, travellerId, label, file).subscribe({
      next: () => {
        this.isUploading = false;
        this.uploadingId = null;
        this.uploadTarget = null;
        this.supportingLabel = '';
        this.loadTravellerDocs(bookingId, travellerId);
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadError = err?.error?.message || 'Upload failed';
        this.loadTravellerDocs(bookingId, travellerId);
      }
    });
  }

  // -------------------------------
  //  Delete
  // -------------------------------
  deleteDocument(doc: DashboardDocumentUI) {
    if (!doc.dbId) return;
    if (this.deletingDocIds.has(doc.dbId)) return;

    this.deletingDocIds.add(doc.dbId);
    this.uploadError = null;

    this.docsApi.deleteDocument(doc.dbId).subscribe({
      next: () => {
        this.deletingDocIds.delete(doc.dbId!);
        if (this.expandedBookingId && this.selectedTravellerId) {
          this.loadTravellerDocs(this.expandedBookingId, this.selectedTravellerId);
        }
      },
      error: (err) => {
        this.deletingDocIds.delete(doc.dbId!);
        this.uploadError = err?.error?.message || 'Delete failed';
      }
    });
  }
}
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BookingDetailsResponse, MyBookingItem, Traveller } from '../../../models/booking.model';
import { TravellerDocument, TravellerDocumentsResponse } from '../../../models/traveller-documents.model';
import { CustomerBookingsService } from '../../../services/customer-bookings/customer-bookings.service';
import { CustomerDocumentsService } from '../../../services/customer-documents/customer-documents.service';


type Tab = 'required' | 'supporting';
type RequiredType = 'passport' | 'visa' | 'id_proof';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent implements OnInit {
  // bookings list
  isLoadingBookings = false;
  bookingsError: string | null = null;
  bookings: MyBookingItem[] = [];

  // selection
  expandedBookingId: number | null = null;
  bookingDetails: BookingDetailsResponse | null = null;
  isLoadingBookingDetails = false;
  bookingDetailsError: string | null = null;

  selectedTravellerId: number | null = null;
  selectedTraveller: Traveller | null = null;

  // docs
  docs: TravellerDocumentsResponse | null = null;
  isLoadingDocs = false;
  docsError: string | null = null;

  // ui state
  activeTab: Tab = 'required';
  uploadError: string | null = null;

  isUploadingRequired: Record<RequiredType, boolean> = {
    passport: false,
    visa: false,
    id_proof: false,
  };

  isUploadingSupporting = false;
  supportingLabel = '';
  supportingFile: File | null = null;

  deletingDocIds = new Set<number>();

  // preview modal
  previewOpen = false;
  previewDoc: TravellerDocument | null = null;
  previewSafeUrl: SafeResourceUrl | null = null;

  constructor(
    private bookingsApi: CustomerBookingsService,
    private docsApi: CustomerDocumentsService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

canDelete(doc?: TravellerDocument | null): boolean {
  if (!doc?.id) return false;
  return doc.status === 'pending'; // ONLY pending
}

deleteTooltip(doc?: TravellerDocument | null): string {
  if (!doc?.id) return 'Nothing to delete';
  if (doc.status === 'pending') return 'Delete this pending document';
  if (doc.status === 'verified') return 'Verified documents cannot be deleted';
  if (doc.status === 'rejected') return 'Rejected documents cannot be deleted (re-upload instead)';
  return 'Only pending documents can be deleted';
}
  // -----------------------
  // Load bookings
  // -----------------------
  loadBookings() {
    this.isLoadingBookings = true;
    this.bookingsError = null;

    this.bookingsApi.getMyBookings().subscribe({
      next: (rows) => {
        // keep your safe filter if needed
        this.bookings = (rows || []).filter(
          (b) => (b.payment_status === 'PAID' && b.status === 'CONFIRMED')
        );
        this.isLoadingBookings = false;
      },
      error: (err) => {
        this.bookingsError = err?.error?.message || 'Failed to load bookings';
        this.isLoadingBookings = false;
      },
    });
  }

  // -----------------------
  // TrackBy
  // -----------------------
  trackByBookingId = (_: number, b: MyBookingItem) => b.booking_id;
  trackByTravellerId = (_: number, t: Traveller) => t.id;
  trackByDocId = (_: number, d: TravellerDocument) =>
    d.id ?? `${d.doc_type}-${d.doc_label ?? ''}`;

  // -----------------------
  // Select booking
  // -----------------------
  expandBooking(bookingId: number) {
    if (this.expandedBookingId === bookingId) {
      this.resetBookingSelection();
      return;
    }

    this.resetBookingSelection();
    this.expandedBookingId = bookingId;

    this.isLoadingBookingDetails = true;
    this.bookingDetailsError = null;

    this.bookingsApi.getBookingDetails(bookingId).subscribe({
      next: (res: BookingDetailsResponse) => {
        this.bookingDetails = res;
        this.isLoadingBookingDetails = false;

        // auto select first traveller
        const first = res?.travellers?.[0];
        if (first) this.selectTraveller(first.id);
      },
      error: (err) => {
        this.bookingDetailsError = err?.error?.message || 'Failed to load booking details';
        this.isLoadingBookingDetails = false;
      },
    });
  }

  private resetBookingSelection() {
    this.expandedBookingId = null;
    this.bookingDetails = null;
    this.bookingDetailsError = null;
    this.isLoadingBookingDetails = false;

    this.selectedTravellerId = null;
    this.selectedTraveller = null;

    this.docs = null;
    this.docsError = null;
    this.isLoadingDocs = false;

    this.activeTab = 'required';
    this.uploadError = null;
    this.supportingLabel = '';
    this.supportingFile = null;
    this.deletingDocIds.clear();

    this.closePreview();
  }

  // -----------------------
  // Select traveller
  // -----------------------
  selectTraveller(travellerId: number) {
    if (!this.bookingDetails?.booking?.id) return;

    this.selectedTravellerId = travellerId;
    this.selectedTraveller =
      (this.bookingDetails.travellers || []).find((t) => t.id === travellerId) || null;

    this.loadTravellerDocs(this.bookingDetails.booking.id, travellerId);
  }

  private loadTravellerDocs(bookingId: number, travellerId: number) {
    this.isLoadingDocs = true;
    this.docsError = null;
    this.docs = null;
    this.uploadError = null;

    this.docsApi.getTravellerDocuments(bookingId, travellerId).subscribe({
      next: (res) => {
        this.docs = res; // includes placeholders for required docs
        this.isLoadingDocs = false;
      },
      error: (err) => {
        this.docsError = err?.error?.message || 'Failed to load documents';
        this.isLoadingDocs = false;
      },
    });
  }

  // -----------------------
  // Helpers
  // -----------------------
  bookingTitle(b: MyBookingItem) {
    return b.tour_title || `Booking #${b.booking_id}`;
  }

  amountInInr(paise: number) {
    return Number(paise || 0) / 100;
  }

  statusClass(status: string) {
    const s = (status || '').toLowerCase();
    if (s === 'verified') return 'ok';
    if (s === 'pending') return 'pending';
    if (s === 'rejected') return 'bad';
    return 'empty';
  }

  isPdfByName(fileName?: string | null, url?: string | null) {
    const s = `${fileName || ''} ${url || ''}`.toLowerCase();
    return s.includes('.pdf') || s.includes('/raw/upload');
  }

  // -----------------------
  // Required upload
  // -----------------------
  onPickRequired(docType: RequiredType, ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!this.expandedBookingId || !this.selectedTravellerId) return;

    this.uploadError = null;
    this.isUploadingRequired[docType] = true;

    this.docsApi.uploadRequired(this.expandedBookingId, this.selectedTravellerId, docType, file).subscribe({
      next: () => {
        this.isUploadingRequired[docType] = false;
        this.loadTravellerDocs(this.expandedBookingId!, this.selectedTravellerId!);
      },
      error: (err) => {
        this.isUploadingRequired[docType] = false;
        this.uploadError = err?.error?.message || 'Upload failed';
      },
    });
  }

  // -----------------------
  // Supporting upload
  // -----------------------
  onPickSupporting(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    input.value = '';
    this.supportingFile = file;
  }

  uploadSupporting() {
    if (!this.expandedBookingId || !this.selectedTravellerId) return;

    const label = (this.supportingLabel || '').trim();
    if (!label) {
      this.uploadError = 'Please enter a document name';
      return;
    }
    if (!this.supportingFile) {
      this.uploadError = 'Please select a file';
      return;
    }

    this.uploadError = null;
    this.isUploadingSupporting = true;

    this.docsApi.uploadSupporting(this.expandedBookingId, this.selectedTravellerId, label, this.supportingFile).subscribe({
      next: () => {
        this.isUploadingSupporting = false;
        this.supportingLabel = '';
        this.supportingFile = null;
        this.loadTravellerDocs(this.expandedBookingId!, this.selectedTravellerId!);
      },
      error: (err) => {
        this.isUploadingSupporting = false;
        this.uploadError = err?.error?.message || 'Upload failed';
      },
    });
  }

  // -----------------------
  // Delete doc
  // -----------------------
  deleteDoc(docId?: number) {
    if (!docId) return;
    if (this.deletingDocIds.has(docId)) return;

    this.deletingDocIds.add(docId);
    this.docsApi.deleteDocument(docId).subscribe({
      next: () => {
        this.deletingDocIds.delete(docId);
        if (this.expandedBookingId && this.selectedTravellerId) {
          this.loadTravellerDocs(this.expandedBookingId, this.selectedTravellerId);
        }
      },
      error: (err) => {
        this.deletingDocIds.delete(docId);
        this.uploadError = err?.error?.message || 'Delete failed';
      },
    });
  }

  // -----------------------
  // Preview
  // -----------------------
  openPreview(doc: TravellerDocument) {
    if (!doc?.file_url) return;
    this.previewDoc = doc;

    // iframe src needs SafeResourceUrl for PDFs
    this.previewSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.file_url);
    this.previewOpen = true;
  }

  closePreview() {
    this.previewOpen = false;
    this.previewDoc = null;
    this.previewSafeUrl = null;
  }
}
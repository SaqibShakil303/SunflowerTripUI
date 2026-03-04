import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';
import { BookingDetailsResponse, MyBookingItem, Traveller } from '../../../models/booking.model';
import { CustomerBookingsService } from '../../../services/customer-bookings/customer-bookings.service';
import { FormsModule } from '@angular/forms';


type TabKey = 'all' | 'upcoming' | 'completed' | 'cancelled';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // UI state
  activeTab: TabKey = 'all';
  isLoadingList = false;
  listError: string | null = null;

  showBoookingDetails = false;
  isLoadingDetails = false;
  detailsError: string | null = null;

  // data
  bookings: MyBookingItem[] = [];
  selectedBookingId: number | null = null;
  selectedDetails: BookingDetailsResponse | null = null;

  // travellers form (simple, no reactive form to keep it quick)
  newTravellers: Array<Partial<Traveller>> = [{ full_name: '', age: null, email: null, phone: null, passport_number: null }];
  isSavingTravellers = false;
  saveTravellersError: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookingsService: CustomerBookingsService
  ) {}

  ngOnInit(): void {
    this.loadMyBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // restore body scroll
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  loadMyBookings(): void {
    this.isLoadingList = true;
    this.listError = null;

    this.bookingsService.getMyBookings()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoadingList = false))
      )
      .subscribe({
        next: (rows) => (this.bookings = Array.isArray(rows) ? rows : []),
        error: (err) => {
          this.listError = err?.error?.message || 'Failed to load bookings';
          this.bookings = [];
        }
      });
  }

  setTab(tab: TabKey) {
    this.activeTab = tab;
  }
trackByBookingId = (_: number, item: MyBookingItem) => item.booking_id;
  get filteredBookings(): MyBookingItem[] {
    const now = new Date();
    const list = this.bookings ?? [];

    if (this.activeTab === 'all') return list;

    return list.filter((b) => {
      const travel = b.travel_date ? new Date(b.travel_date) : null;

      if (this.activeTab === 'cancelled') {
        return String(b.status).toUpperCase() === 'CANCELLED';
      }

      // completed: travel date passed OR status says completed-like
      if (this.activeTab === 'completed') {
        return (!!travel && travel.getTime() < now.getTime()) && String(b.status).toUpperCase() === 'CONFIRMED';
      }

      // upcoming: travel date in future and confirmed
      if (this.activeTab === 'upcoming') {
        return (!!travel && travel.getTime() >= now.getTime()) && String(b.status).toUpperCase() === 'CONFIRMED';
      }

      return true;
    });
  }

  // UI helpers
  formatGuests(n: number) {
    const v = Number(n || 0);
    return v === 1 ? '1 Guest' : `${v} Guests`;
  }

  amountInInr(paise: number): number {
    const p = Number(paise || 0);
    return p / 100;
  }

  statusBadgeClass(b: MyBookingItem): 'info' | 'success' | 'danger' {
    const status = String(b.status || '').toUpperCase();
    const travel = b.travel_date ? new Date(b.travel_date) : null;
    const now = new Date();

    if (status === 'CANCELLED') return 'danger';
    if (travel && travel.getTime() < now.getTime()) return 'success'; // completed by time
    return 'info';
  }

  statusLabel(b: MyBookingItem): string {
    const status = String(b.status || '').toUpperCase();
    const travel = b.travel_date ? new Date(b.travel_date) : null;
    const now = new Date();

    if (status === 'CANCELLED') return 'Cancelled';
    if (travel && travel.getTime() < now.getTime()) return 'Completed';
    return 'Upcoming';
  }

  // Details drawer
  openDetails(bookingId: number): void {
    this.selectedBookingId = bookingId;
    this.showBoookingDetails = true;
    this.detailsError = null;
    this.selectedDetails = null;
    this.resetTravellerForm();

    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';

    this.isLoadingDetails = true;
    this.bookingsService.getBookingDetails(bookingId)
      .pipe(finalize(() => (this.isLoadingDetails = false)))
      .subscribe({
        next: (res) => {
          this.selectedDetails = res;
          // prefill traveller rows up to booking.guests if you want
        },
        error: (err) => {
          this.detailsError = err?.error?.message || 'Failed to load booking details';
        }
      });
  }

  closeDetails(): void {
    this.showBoookingDetails = false;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  // Travellers form actions
  resetTravellerForm() {
    this.newTravellers = [{ full_name: '', age: null, email: null, phone: null, passport_number: null }];
    this.saveTravellersError = null;
  }

  addTravellerRow(): void {
    // optional: prevent adding more rows than allowed guests
    const allowed = this.selectedDetails?.booking?.guests ?? Infinity;
    const existing = this.selectedDetails?.travellers?.length ?? 0;
    const currentNew = this.newTravellers.length;

    if (existing + currentNew >= allowed) return;

    this.newTravellers.push({ full_name: '', age: null, email: null, phone: null, passport_number: null });
  }

  removeTravellerRow(i: number): void {
    if (this.newTravellers.length === 1) return;
    this.newTravellers.splice(i, 1);
  }

  saveTravellers(): void {
    if (!this.selectedBookingId) return;

    // clean + validate
    const payload = this.newTravellers
      .map(t => ({
        full_name: (t.full_name || '').trim(),
        age: t.age != null ? Number(t.age) : null,
        email: t.email ? String(t.email).trim() : null,
        phone: t.phone ? String(t.phone).trim() : null,
        passport_number: t.passport_number ? String(t.passport_number).trim() : null
      }))
      .filter(t => t.full_name.length > 0);

    if (!payload.length) {
      this.saveTravellersError = 'Please enter at least one traveller name';
      return;
    }

    this.isSavingTravellers = true;
    this.saveTravellersError = null;

    this.bookingsService.addTravellers(this.selectedBookingId, payload)
      .pipe(finalize(() => (this.isSavingTravellers = false)))
      .subscribe({
        next: async () => {
          // reload details so travellers list updates
          this.openDetails(this.selectedBookingId!);
        },
        error: (err) => {
          this.saveTravellersError = err?.error?.message || 'Failed to save travellers';
        }
      });
  }

  // Drawer text helpers
  get drawerTitle(): string {
    return this.selectedDetails?.booking?.tour_title || 'Booking Details';
  }

  get drawerImage(): string {
    return this.selectedDetails?.booking?.tour_image_url || '../../../../assets/images/luxury/dubai-stunning.jpg';
  }

  get drawerGuests(): string {
    return this.formatGuests(this.selectedDetails?.booking?.guests || 0);
  }

  get drawerDateText(): string {
    const d = this.selectedDetails?.booking?.travel_date;
    if (!d) return '';
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  parseChildAges(json: string | null | undefined): string {
    if (!json) return '';
    try {
      const arr = JSON.parse(json);
      if (!Array.isArray(arr)) return '';
      return arr.join(', ');
    } catch {
      return '';
    }
  }
}
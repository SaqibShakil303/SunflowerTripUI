import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsService } from '../../services/bookings/bookings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  // use "any" here because the API returns joined/aliased columns
  bookings: any[] = [];
  filteredBookings: any[] = [];
  paginatedBookings: any[] = [];

  searchTerm = '';
  // allow sorting by any of these fields
  sortBy: string = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';

  currentPage = 1;
  pageSize = 10;

  showDeleteModal = false;
  bookingToDelete: any | null = null;

  constructor(private bookingService: BookingsService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (data: any[]) => {
        // normalize rows for the UI
        this.bookings = data.map((row: any) => {
          const id = row.booking_detail_id ?? row.id ?? null;
          const guestsComputed =
            row.booking_guests ??
            (Number(row.adults || 0) + Number(row.children || 0));

          return {
            ...row,
            id, // keep legacy usage (delete uses this)
            child_ages: Array.isArray(row.child_ages) ? row.child_ages : [],
            guestsComputed,
            // helpful parsed numbers
            tour_price_number:
              row.tour_price_inr != null ? Number(row.tour_price_inr) : null,
            isExpanded: false,
            isDeleting: false,
          };
        });
        this.applyFilters();
      },
      error: (err) => console.error('Failed to fetch bookings', err),
    });
  }

  deleteBooking(booking: any): void {
    this.bookingToDelete = booking;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.bookingToDelete) return;

    this.bookingToDelete.isDeleting = true;
    // backend delete expects booking_details.id -> we normalized as .id above
    this.bookingService.deleteBooking(this.bookingToDelete.id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter((b) => b !== this.bookingToDelete);
        this.applyFilters();
        this.cancelDelete();
         this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.bookingToDelete!.isDeleting = false;
        this.cancelDelete();
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.bookingToDelete = null;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  onSort(): void {
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.bookings];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((b) =>
        (b.name && b.name.toLowerCase().includes(term)) ||
        (b.email && b.email.toLowerCase().includes(term)) ||
        (b.tour_title && b.tour_title.toLowerCase().includes(term)) ||
        String(b.booking_id_ref ?? b.booking_id ?? '').includes(term) ||
        String(b.tour_id ?? '').includes(term) ||
        String(b.phone ?? '').includes(term)
      );
    }

    filtered.sort((a, b) => {
      const key = this.sortBy;
      const get = (x: any) => {
        const v = x[key];
        if (key === 'travel_date' || key === 'created_at' || key === 'departure_date') {
          return v ? new Date(v).getTime() : 0;
        }
        if (key === 'total_amount_paise') return Number(v || 0);
        // default string compare
        return String(v ?? '').toLowerCase();
      };
      const A = get(a), B = get(b);
      const cmp = A < B ? -1 : A > B ? 1 : 0;
      return this.sortOrder === 'asc' ? cmp : -cmp;
    });

    this.filteredBookings = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedBookings = this.filteredBookings.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredBookings.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredBookings.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  formatDate(date: string | Date | undefined | null): string {
    return date
      ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })
      : '';
  }

  formatTime(date: string | Date | undefined | null): string {
    return date
      ? new Date(date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : '';
  }

  formatINRFromPaise(paise?: number | null): string {
    if (paise == null) return '-';
    const rupees = paise / 100;
    return '₹ ' + rupees.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  formatINR(val?: number | string | null): string {
    if (val == null || val === '') return '-';
    const num = typeof val === 'string' ? Number(val) : val;
    if (!isFinite(num as number)) return String(val);
    return '₹ ' + (num as number).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  getGuests(b: any): number {
    return Number(b.guestsComputed || 0);
  }

  trackByBookingId(index: number, item: any): number {
    return item.booking_detail_id ?? item.id ?? index;
  }

  toggleExpanded(booking: any): void {
    booking.isExpanded = !booking.isExpanded;
  }

  refreshBookings(): void {
    this.searchTerm = '';
    this.loadBookings();
  }

  exportBookings(): void {
    const headers = [
      'booking_detail_id','booking_id_ref','tour_id',
      'tour_title','tour_category','tour_duration_days','tour_price_inr',
      'name','email','phone','adults','children','child_ages',
      'travel_date','total_amount_paise','payment_status','booking_status',
      'departure_id','departure_date','departure_available_seats','created_at'
    ];
    const rows = this.filteredBookings.map(b =>
      headers.map(h => {
        const v = (b as any)[h];
        if (h === 'child_ages') return JSON.stringify(v ?? []);
        if (['travel_date','created_at','departure_date'].includes(h)) return this.formatDate(v);
        if (h === 'total_amount_paise') return v != null ? (v/100).toFixed(2) : '';
        return typeof v === 'object' ? JSON.stringify(v ?? '') : (v ?? '');
      }).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

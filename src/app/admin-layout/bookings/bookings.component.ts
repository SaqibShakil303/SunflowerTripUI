import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Booking } from '../../models/booking.model';
import { BookingsService } from '../../services/bookings/bookings.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  paginatedBookings: Booking[] = [];
  searchTerm = '';
  sortBy: keyof Booking = 'travel_date';
  sortOrder: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  pageSize = 10;

  showDeleteModal = false;
  bookingToDelete: Booking | null = null;

  constructor(private bookingService: BookingsService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data.map((b: Booking) => ({
          ...b,
          isExpanded: false,
          isDeleting: false
        }));
        this.applyFilters();
      },
      error: (err) => console.error('Failed to fetch bookings', err)
    });
  }

  deleteBooking(booking: Booking): void {
    this.bookingToDelete = booking;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.bookingToDelete) return;

    this.bookingToDelete.isDeleting = true;
    this.bookingService.deleteBooking(this.bookingToDelete.email).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b !== this.bookingToDelete);
        this.applyFilters();
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.bookingToDelete!.isDeleting = false;
        this.cancelDelete();
      }
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
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      const valA = this.sortBy === 'travel_date' || this.sortBy === 'created_at'
        ? new Date(a[this.sortBy]!).getTime()
        : String(a[this.sortBy] ?? '').toLowerCase();

      const valB = this.sortBy === 'travel_date' || this.sortBy === 'created_at'
        ? new Date(b[this.sortBy]!).getTime()
        : String(b[this.sortBy] ?? '').toLowerCase();

      return this.sortOrder === 'asc'
        ? valA < valB ? -1 : valA > valB ? 1 : 0
        : valA > valB ? -1 : valA < valB ? 1 : 0;
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

  formatDate(date: string | Date | undefined): string {
    return date ? new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }) : '';
  }

  formatTime(date: string | Date | undefined): string {
    return date ? new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : '';
  }

  trackByEmail(index: number, booking: Booking): string {
    return booking.email;
  }

  toggleDetails(booking: Booking): void {
    booking.isExpanded = !booking.isExpanded;
  }
  refreshBookings(): void {
    this.loadBookings();
  }

  // Add this method to export bookings as CSV
exportBookings() {
  const headers = Object.keys(this.filteredBookings[0] || {});
const rows = this.filteredBookings.map(b => headers.map(h => JSON.stringify((b as any)[h] ?? '')).join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookings.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Use in *ngFor trackBy
trackByBookingId(index: number, item: any): number {
  return item.id || index;
}

// Toggle expand/collapse
toggleExpanded(booking: any) {
  booking.isExpanded = !booking.isExpanded;
}

}


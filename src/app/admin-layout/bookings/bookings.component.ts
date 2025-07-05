import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Booking interface
interface Booking {
  id: number;
  tourId: string;
  name: string;
  email: string;
  phone?: string;
  days?: number;
  numAdults?: number;
  numChildren?: number;
  childAges?: string;
  hotelRating?: string;
  mealPlan?: string;
  flightOption?: string;
  travelDate: Date;
  createdDate: Date;
  isDeleting?: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {
  // Data properties
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  paginatedBookings: Booking[] = [];

  // Search and filter properties
  searchTerm: string = '';

  // Sorting properties
  sortBy: string = 'createdDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  // Modal properties
  showDeleteModal: boolean = false;
  bookingToDelete: Booking | null = null;

  ngOnInit(): void {
    this.loadBookings();
  }

  // Load initial bookings data
  loadBookings(): void {
    // Mock data - replace with actual service call
    this.bookings = [
      {
        id: 1,
        tourId: 'B001',
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1234567890',
        days: 7,
        numAdults: 2,
        numChildren: 1,
        childAges: '4',
        hotelRating: '4-star',
        mealPlan: 'Breakfast',
        flightOption: 'With Flight',
        travelDate: new Date('2025-08-01'),
        createdDate: new Date('2025-06-15T09:00:00'),
        isDeleting: false,
        isExpanded: false
      },
      {
        id: 2,
        tourId: 'B002',
        name: 'Bob Williams',
        email: 'bob.williams@email.com',
        phone: '+0987654321',
        days: 5,
        numAdults: 3,
        numChildren: 2,
        childAges: '6,8',
        hotelRating: '3-star',
        mealPlan: 'Breakfast and Dinner',
        flightOption: 'Without Flight',
        travelDate: new Date('2025-09-10'),
        createdDate: new Date('2025-06-16T14:30:00'),
        isDeleting: false,
        isExpanded: false
      }
    ];
    
    this.applyFilters();
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  // Sorting functionality
  onSort(): void {
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // Apply filters, search, and sorting
  applyFilters(): void {
    let filtered = [...this.bookings];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.name.toLowerCase().includes(term) ||
        booking.email.toLowerCase().includes(term) ||
        booking.tourId.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any = a[this.sortBy as keyof Booking];
      let valueB: any = b[this.sortBy as keyof Booking];

      // Handle date sorting
      if (this.sortBy === 'createdDate' || this.sortBy === 'travelDate') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      } else {
        // Convert to string for comparison
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.filteredBookings = filtered;
    this.updatePagination();
  }

  // Pagination functionality
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedBookings = this.filteredBookings.slice(startIndex, endIndex);
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
    const pages: number[] = [];
    
    // Show max 5 page numbers
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
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

  // Expand/collapse functionality
  toggleExpanded(booking: Booking): void {
    booking.isExpanded = !booking.isExpanded;
  }

  // Delete functionality
  deleteBooking(booking: Booking): void {
    this.bookingToDelete = booking;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.bookingToDelete) {
      // Set deleting state
      this.bookingToDelete.isDeleting = true;
      
      // Simulate API call delay
      setTimeout(() => {
        if (this.bookingToDelete) {
          // Remove from bookings array
          this.bookings = this.bookings.filter(b => b.id !== this.bookingToDelete!.id);
          
          // Reapply filters and update pagination
          this.applyFilters();
          
          // Adjust current page if necessary
          if (this.paginatedBookings.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
          }
        }
        
        this.cancelDelete();
      }, 1000);
    }
  }

  cancelDelete(): void {
    if (this.bookingToDelete) {
      this.bookingToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.bookingToDelete = null;
  }

  // Utility functions
  refreshBookings(): void {
    this.loadBookings();
  }

  exportBookings(): void {
    // Implement export functionality
    const dataToExport = this.filteredBookings.map(booking => ({
      'Tour ID': booking.tourId,
      'Name': booking.name,
      'Email': booking.email,
      'Phone': booking.phone || 'Not provided',
      'Days': booking.days || 'Not specified',
      'No. of Adults': booking.numAdults || 'Not specified',
      'No. of Children': booking.numChildren || '0',
      'Child Ages': booking.childAges || 'None',
      'Hotel Rating': booking.hotelRating || 'Not specified',
      'Meal Plan': booking.mealPlan || 'Not specified',
      'Flight Option': booking.flightOption || 'Not specified',
      'Travel Date': this.formatDate(booking.travelDate),
      'Created Date': this.formatDate(booking.createdDate) + ' ' + this.formatTime(booking.createdDate)
    }));

    // Convert to CSV
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Date formatting
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // TrackBy function for ngFor optimization
  trackByBookingId(index: number, booking: Booking): number {
    return booking.id;
  }
}
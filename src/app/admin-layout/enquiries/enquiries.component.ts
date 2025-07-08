import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Enquiry } from '../../models/Enquiry.model';
import { BookingsService } from '../../services/bookings/bookings.service';

@Component({
  selector: 'app-enquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enquiries.component.html',
  styleUrls: ['./enquiries.component.scss']
})
export class EnquiriesComponent implements OnInit {
  enquiries: Enquiry[] = [];
  filteredEnquiries: Enquiry[] = [];
  paginatedEnquiries: Enquiry[] = [];
  searchTerm = '';
  sortBy: keyof Enquiry = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  pageSize = 10;
  showDeleteModal = false;
  enquiryToDelete: Enquiry | null = null;
  errorMessage: string | null = null; // For displaying errors

  constructor(private bookingService: BookingsService) {}

  ngOnInit(): void {
    this.loadEnquiries();
  }

  loadEnquiries(): void {
    this.bookingService.getAllEnquiries().subscribe({
      next: (data) => {
        this.enquiries = data.map((enquiry: any) => ({
          ...enquiry,
          created_at: enquiry.createdDate ? new Date(enquiry.created_at) : new Date(),
          isDeleting: false,
          isExpanded: false
        }));
        this.applyFilters();
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to fetch enquiries';
        console.error('Failed to fetch enquiries', err);
      }
    });
  }

  deleteEnquiry(enquiry: Enquiry): void {
    this.enquiryToDelete = enquiry;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.enquiryToDelete) return;

    this.enquiryToDelete.isDeleting = true;
    this.bookingService.deleteEnquiry(this.enquiryToDelete.id).subscribe({
      next: () => {
        this.enquiries = this.enquiries.filter(e => e.id !== this.enquiryToDelete!.id);
        this.applyFilters();
        this.cancelDelete();
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to delete enquiry';
        console.error('Delete failed', err);
        if (this.enquiryToDelete) {
          this.enquiryToDelete.isDeleting = false;
        }
      }
    });
  }

  cancelDelete(): void {
    if (this.enquiryToDelete) {
      this.enquiryToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.enquiryToDelete = null;
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
    let filtered = [...this.enquiries];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(enquiry =>
        enquiry.name.toLowerCase().includes(term) ||
        enquiry.email.toLowerCase().includes(term) ||
        enquiry.tour_id.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let valueA: any = a[this.sortBy];
      let valueB: any = b[this.sortBy];

      if (this.sortBy === 'created_at') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      } else {
        valueA = String(valueA ?? '').toLowerCase();
        valueB = String(valueB ?? '').toLowerCase();
      }

      return this.sortOrder === 'asc'
        ? valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        : valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    });

    this.filteredEnquiries = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEnquiries = this.filteredEnquiries.slice(startIndex, endIndex);
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
    return Math.ceil(this.filteredEnquiries.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

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
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredEnquiries.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  trackByEnquiryId(index: number, enquiry: Enquiry): number {
    return enquiry.id;
  }

  toggleExpanded(enquiry: Enquiry): void {
    enquiry.isExpanded = !enquiry.isExpanded;
    console.log('Toggled isExpanded for enquiry:', enquiry.id, enquiry.isExpanded);
  }

  refreshEnquiries(): void {
    this.loadEnquiries();
  }

  exportEnquiries(): void {
    const headers = ['id', 'tour_id', 'name', 'email', 'phone', 'description', 'created_at'];
    const rows = this.filteredEnquiries.map(enquiry =>
      headers.map(h => {
        if (h === 'created_at') return `"${this.formatDate(enquiry[h])} ${this.formatTime(enquiry[h])}"`;
        return `"${enquiry[h as keyof Enquiry] ?? ''}"`;
      }).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enquiries_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
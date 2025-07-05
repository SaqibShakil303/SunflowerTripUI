import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Enquiry interface
interface Enquiry {
  id: number;
  tourId: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  createdDate: Date;
  isDeleting?: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-enquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enquiries.component.html',
  styleUrl: './enquiries.component.scss'
})
export class EnquiriesComponent implements OnInit {
  // Data properties
  enquiries: Enquiry[] = [];
  filteredEnquiries: Enquiry[] = [];
  paginatedEnquiries: Enquiry[] = [];

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
  enquiryToDelete: Enquiry | null = null;

  ngOnInit(): void {
    this.loadEnquiries();
  }

  // Load initial enquiries data
  loadEnquiries(): void {
    // Mock data - replace with actual service call
    this.enquiries = [
      {
        id: 1,
        tourId: 'T001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        description: 'Interested in the heritage tour package',
        createdDate: new Date('2024-01-15T10:30:00'),
        isDeleting: false,
        isExpanded: false
      },
      {
        id: 2,
        tourId: 'T002',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+0987654321',
        description: 'Looking for adventure tour options',
        createdDate: new Date('2024-01-14T14:20:00'),
        isDeleting: false,
        isExpanded: false
      },
      // Add more mock data as needed
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
    let filtered = [...this.enquiries];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(enquiry => 
        enquiry.name.toLowerCase().includes(term) ||
        enquiry.email.toLowerCase().includes(term) ||
        enquiry.tourId.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any = a[this.sortBy as keyof Enquiry];
      let valueB: any = b[this.sortBy as keyof Enquiry];

      // Handle date sorting
      if (this.sortBy === 'createdDate') {
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

    this.filteredEnquiries = filtered;
    this.updatePagination();
  }

  // Pagination functionality
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
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredEnquiries.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  // Expand/collapse functionality
  toggleExpanded(enquiry: Enquiry): void {
    enquiry.isExpanded = !enquiry.isExpanded;
  }

  // Delete functionality
  deleteEnquiry(enquiry: Enquiry): void {
    this.enquiryToDelete = enquiry;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.enquiryToDelete) {
      // Set deleting state
      this.enquiryToDelete.isDeleting = true;
      
      // Simulate API call delay
      setTimeout(() => {
        if (this.enquiryToDelete) {
          // Remove from enquiries array
          this.enquiries = this.enquiries.filter(e => e.id !== this.enquiryToDelete!.id);
          
          // Reapply filters and update pagination
          this.applyFilters();
          
          // Adjust current page if necessary
          if (this.paginatedEnquiries.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
          }
        }
        
        this.cancelDelete();
      }, 1000);
    }
  }

  cancelDelete(): void {
    if (this.enquiryToDelete) {
      this.enquiryToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.enquiryToDelete = null;
  }

  // Utility functions
  refreshEnquiries(): void {
    this.loadEnquiries();
  }

  exportEnquiries(): void {
    // Implement export functionality
    const dataToExport = this.filteredEnquiries.map(enquiry => ({
      'Tour ID': enquiry.tourId,
      'Name': enquiry.name,
      'Email': enquiry.email,
      'Phone': enquiry.phone || 'Not provided',
      'Description': enquiry.description || 'No description',
      'Created Date': this.formatDate(enquiry.createdDate) + ' ' + this.formatTime(enquiry.createdDate)
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
    link.download = `enquiries_${new Date().toISOString().split('T')[0]}.csv`;
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
  trackByEnquiryId(index: number, enquiry: Enquiry): number {
    return enquiry.id;
  }
}
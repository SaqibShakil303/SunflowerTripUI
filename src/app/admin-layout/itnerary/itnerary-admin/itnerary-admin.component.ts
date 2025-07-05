import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItineraryService } from '../../../services/itinerary/itinerary.service';
import { Itinerary } from '../../../models/itinerary.model';
import { catchError, of, tap } from 'rxjs';

// Extend interface to include isDeleting and showDetails
interface ExtendedItinerary extends Itinerary {
  isDeleting?: boolean;
  showDetails?: boolean;
}

@Component({
  selector: 'app-itnerary-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './itnerary-admin.component.html',
  styleUrl: './itnerary-admin.component.scss'
})
export class ItneraryAdminComponent implements OnInit {
  // Data properties
  itineraries: ExtendedItinerary[] = [];
  filteredItineraries: ExtendedItinerary[] = [];
  paginatedItineraries: ExtendedItinerary[] = [];
  error: string | null = null;

  // Search and filter properties
  searchTerm: string = '';
  sortBy: string = 'email';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  // Modal properties
  showDeleteModal: boolean = false;
  itineraryToDelete: ExtendedItinerary | null = null;

  constructor(private itineraryService: ItineraryService) {}

  ngOnInit(): void {
    this.loadItineraries();
  }

  /**
   * Load itineraries data from service
   */
  loadItineraries(): void {
    this.itineraryService.getItineraries().pipe(
      tap((itineraries) => {
        this.itineraries = itineraries.map(itinerary => ({ ...itinerary, isDeleting: false, showDetails: false }));
        this.applyFiltersAndSort();
        this.error = null;
      }),
      catchError((error) => {
        console.error('Error fetching itineraries:', error);
        this.error = 'Failed to load itineraries';
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Toggle details visibility
   */
  toggleDetails(itinerary: ExtendedItinerary): void {
    itinerary.showDetails = !itinerary.showDetails;
  }

  /**
   * Apply search, sort, and pagination
   */
  applyFiltersAndSort(): void {
    // Apply search filter
    if (this.searchTerm.trim()) {
      this.filteredItineraries = this.itineraries.filter(itinerary =>
        itinerary.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        itinerary.destination?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredItineraries = [...this.itineraries];
    }

    // Apply sorting
    this.filteredItineraries.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'email':
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case 'destination':
          valueA = a.destination?.toLowerCase();
          valueB = b.destination?.toLowerCase();
          break;
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'created_at':
          valueA = new Date(a.created_at ?? '').getTime();
          valueB = new Date(b.created_at ?? '').getTime();
          break;
        default:
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    // Reset to first page when filters change
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Update pagination
   */
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedItineraries = this.filteredItineraries.slice(startIndex, endIndex);
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    this.applyFiltersAndSort();
  }

  /**
   * Handle sort change
   */
  onSort(): void {
    this.applyFiltersAndSort();
  }

  /**
   * Toggle sort order
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFiltersAndSort();
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFiltersAndSort();
  }

  /**
   * Refresh itineraries data
   */
  refreshItineraries(): void {
    this.loadItineraries();
    console.log('Itineraries refreshed');
  }

  /**
   * Export itineraries data
   */
  exportItineraries(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `itineraries_export_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    console.log('Itineraries exported');
  }

  /**
   * Generate CSV content
   */
  private generateCSV(): string {
    const headers = ['Serial Number', 'Name', 'Phone','Email', 'Destination', 'Travelers', 'Children', 'Child Ages', 'Duration', 'Travel Date', 'Created At'];
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    this.filteredItineraries.forEach((itinerary, index) => {
      const row = [
        index + 1,
        `"${itinerary.name}"`,
        `"${itinerary.phone}"`,
        `"${itinerary.email}"`,
        `"${itinerary.destination}"`,
        itinerary.travelers,
        itinerary.children,
        `"${this.formatChildAges(itinerary.childAges ?? [])}"`,
        itinerary.duration,
        `"${this.formatDate(itinerary.date)}"`,
        `"${this.formatDate(itinerary.created_at ?? '')} ${this.formatTime(itinerary.created_at ?? '')}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Delete itinerary (show confirmation modal)
   */
  deleteItinerary(itinerary: ExtendedItinerary): void {
    this.itineraryToDelete = itinerary;
    this.showDeleteModal = true;
  }

  /**
   * Confirm delete itinerary
   */
  confirmDelete(): void {
    if (this.itineraryToDelete) {
      this.itineraryToDelete.isDeleting = true;
      this.itineraryService.deleteItinerary(this.itineraryToDelete.id!).pipe(
        tap(() => {
          this.itineraries = this.itineraries.filter(i => i.id !== this.itineraryToDelete!.id);
          this.showDeleteModal = false;
          this.itineraryToDelete = null;
          this.applyFiltersAndSort();
          console.log('Itinerary deleted successfully');
        }),
        catchError((error) => {
          console.error('Error deleting itinerary:', error);
          this.error = 'Failed to delete itinerary';
          if (this.itineraryToDelete) {
            this.itineraryToDelete.isDeleting = false;
          }
          this.showDeleteModal = false;
          this.itineraryToDelete = null;
          return of(null);
        })
      ).subscribe();
    }
  }

  /**
   * Cancel delete operation
   */
  cancelDelete(): void {
    if (this.itineraryToDelete) {
      this.itineraryToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.itineraryToDelete = null;
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Format time for display
   */
  formatTime(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  }

  /**
   * Format child ages for display
   */
  formatChildAges(ages: number[]): string {
    return ages.join(', ');
  }

  /**
   * Get serial number for display
   */
  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  /**
   * Track by function for ngFor
   */
  trackByItineraryId(index: number, itinerary: ExtendedItinerary): number {
    return itinerary.id ?? 0;
  }

  /**
   * Get total number of pages
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredItineraries.length / this.pageSize);
  }

  /**
   * Get start index for pagination info
   */
  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  /**
   * Get end index for pagination info
   */
  getEndIndex(): number {
    const endIndex = this.currentPage * this.pageSize;
    return Math.min(endIndex, this.filteredItineraries.length);
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /**
   * Get array of page numbers for pagination
   */
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}
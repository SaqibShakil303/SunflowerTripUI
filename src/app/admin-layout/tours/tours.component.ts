import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddTourComponent } from './add-tour/add-tour.component';
import { EditTourComponent } from './edit-tour/edit-tour.component';
import { ItineraryDay, Tour } from '../../models/tour.model';
import { TourService } from '../../services/tours/tour.service';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './tours.component.html',
  styleUrl: './tours.component.scss'
})
export class ToursComponent implements OnInit {
  // Search and filtering
  searchTerm: string = '';

  // Sorting
  sortBy: string = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  // Data arrays
  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  paginatedTours: Tour[] = [];

  // Modal state
  showDeleteModal: boolean = false;
  tourToDelete: Tour | null = null;

  constructor(
    private dialog: MatDialog,
    private tourService: TourService // Inject TourService
  ) { }

  ngOnInit(): void {
    this.loadTours();
    this.applyFiltersAndSort();
  }

 private parseStringArray(value: any): string[] {
  try {
    return Array.isArray(value) ? value : JSON.parse(value || '[]');
  } catch {
    return [];
  }
}
  // Load tours data from API
  private loadTours(): void {
    this.tourService.getAllTours().subscribe({
     next: (tours: Tour[]) => {
  this.tours = tours
    .filter(t => t.title && t.slug) // remove invalid entries like id:14
    .map(tour => ({
      ...tour,
      itinerary: this.parseItinerary(tour.itinerary),
      // Convert stringified JSON arrays to actual arrays
      inclusions: this.parseStringArray(tour.inclusions),
      exclusions: this.parseStringArray(tour.exclusions),
      complementaries: this.parseStringArray(tour.complementaries),
      highlights: this.parseStringArray(tour.highlights),
      meals_included: this.parseStringArray(tour.meals_included),
      dietary_restrictions_supported: this.parseStringArray(tour.dietary_restrictions_supported),
      languages_supported: this.parseStringArray(tour.languages_supported),
      guide_languages: this.parseStringArray(tour.guide_languages),
      activity_types: this.parseStringArray(tour.activity_types),
      interests: this.parseStringArray(tour.interests),
      packing_list: this.parseStringArray(tour.packing_list),
      photos: tour.photos || [],
            reviews: tour.reviews || [],
      showDetails: false,
      isDeleting: false
    }));
  this.applyFiltersAndSort();
},
      error: (error) => {
        console.error('Error fetching tours:', error);
        // Optionally handle error (e.g., show error message to user)
        this.tours = [];
        this.applyFiltersAndSort();
      }
    });
  }

  
private parseItinerary(itinerary: string | ItineraryDay[]): ItineraryDay[] {
  if (Array.isArray(itinerary)) {
    return itinerary;
  }
  if (!itinerary) {
    return [];
  }
  return itinerary.split(' · ').map((day, index) => ({
    day: index + 1,
    title: day.split(': ')[0] || `Day ${index + 1}`,
    description: day.split(': ')[1] || 'No description',
    activities: [],
    meals_included: [],
    accommodation: ''
  }));
}
  getItineraryArray(itinerary: string | ItineraryDay[]): ItineraryDay[] {
    return Array.isArray(itinerary) ? itinerary : [];
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  // Sorting functionality
  onSort(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.onSort();
  }

  // Apply filters and sorting
  private applyFiltersAndSort(): void {
    // Filter tours based on search term
    this.filteredTours = this.tours.filter(tour =>
      (tour.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
      (tour.location?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
      (tour.category?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
      (tour.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false)
    );

    // Sort tours
    this.filteredTours.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'destination':
          aValue = a.location || '';
          bValue = b.location || '';
          break;
        case 'price':
          aValue = typeof a.price === 'string' ? parseFloat(a.price) : a.price || 0;
          bValue = typeof b.price === 'string' ? parseFloat(b.price) : b.price || 0;
          break;
        case 'duration':
          aValue = a.duration_days || 0;
          bValue = b.duration_days || 0;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        default:
          aValue = a.title || '';
          bValue = b.title || '';
      }

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue - bValue;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.updatePagination();
  }

  // Pagination functionality
  private updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTours = this.filteredTours.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTours.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagination();
    }
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

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredTours.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  // Details functionality
  toggleDetails(tour: Tour): void {
    tour.showDetails = !tour.showDetails;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTourComponent, {
      width: '800px',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add the tour
        result.id = Math.max(...this.tours.map(t => t.id)) + 1;
        this.tours.push(result);
        this.applyFiltersAndSort();
      }
    });
  }

  // Edit functionality
  openEditDialog(tour: Tour): void {
    const dialogRef = this.dialog.open(EditTourComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { ...tour } // Pass a copy of the tour data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the tour in the tours array
        const index = this.tours.findIndex(t => t.id === result.id);
        if (index !== -1) {
          this.tours[index] = result;
          this.applyFiltersAndSort();
        }
      }
    });
  }

  // Delete functionality
  deleteTour(tour: Tour): void {
    this.tourToDelete = tour;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.tourToDelete) {
      // Set deleting state
      this.tourToDelete.isDeleting = true;

      // Simulate API call delay
      setTimeout(() => {
        if (this.tourToDelete) {
          // Remove from tours array
          this.tours = this.tours.filter(t => t.id !== this.tourToDelete!.id);

          // Reapply filters and update pagination
          this.applyFiltersAndSort();

          // Adjust current page if necessary
          const totalPages = this.getTotalPages();
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
            this.updatePagination();
          }
        }

        this.cancelDelete();
      }, 1000);
    }
  }

  cancelDelete(): void {
    if (this.tourToDelete) {
      this.tourToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.tourToDelete = null;
  }

  // Refresh functionality
  refreshTours(): void {
    // Refresh data from API
    this.loadTours();
    this.searchTerm = '';
    this.currentPage = 1;
  }

  // TrackBy function for ngFor performance
  trackByTourId(index: number, tour: Tour): number {
    return tour.id;
  }
}
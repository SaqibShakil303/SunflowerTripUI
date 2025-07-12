import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddTourComponent } from './add-tour/add-tour.component';
import { EditTourComponent } from './edit-tour/edit-tour.component';
import { ItineraryDay, RoomType, Tour, TourPhoto, TourReview } from '../../models/tour.model';
import { TourService } from '../../services/tours/tour.service';
interface TourPayload {
  tour: Tour;
  photos: TourPhoto[];
  reviews: TourReview[];
  room_types: RoomType[];
  itinerary: ItineraryDay[];
}

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
  isLoading: boolean = true;

  constructor(
    private dialog: MatDialog,
    private tourService: TourService // Inject TourService
  ) { }

  ngOnInit(): void {
    this.loadTours();
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
    this.isLoading = true;
    this.tourService.getAllTours().subscribe({
      next: (tours: Tour[]) => {
        this.tours = tours
          .filter(t => t.title && t.slug)
          .map(tour => ({
            ...tour,
            itinerary: this.parseItinerary(tour.itinerary),
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
        this.isLoading = false;
        this.applyFiltersAndSort();
      },
      error: (error) => {
        console.error('Error fetching tours:', error);
        this.tours = [];
        this.isLoading = false;
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
    const payload: TourPayload = {
      tour: {
        id: tour.id || 0,
        destination_id: tour.destination_id || 0,
        destination_title: tour.destination_title || '',
        location_ids: tour.location_ids || [],
        title: tour.title || 'Untitled Tour',
        slug: tour.slug || '',
        location: tour.location || '',
        description: tour.description || '',
        price: tour.price || '0.00',
        price_per_person: tour.price_per_person || '0.00',
        price_currency: tour.price_currency || 'INR',
        image_url: tour.image_url || '',
        map_embed_url: tour.map_embed_url || '',
        duration_days: tour.duration_days || 1,
        available_from: tour.available_from || '',
        available_to: tour.available_to || '',
        category: tour.category || '',
        departure_airport: tour.departure_airport || '',
        arrival_airport: tour.arrival_airport || '',
        max_group_size: tour.max_group_size,
        min_group_size: tour.min_group_size,
        inclusions: tour.inclusions || [],
        exclusions: tour.exclusions || [],
        complementaries: tour.complementaries || [],
        highlights: tour.highlights || [],
        booking_terms: tour.booking_terms || '',
        cancellation_policy: tour.cancellation_policy || '',
        meta_title: tour.meta_title || '',
        meta_description: tour.meta_description || '',
        early_bird_discount: tour.early_bird_discount,
        group_discount: tour.group_discount,
        difficulty_level: tour.difficulty_level || 'Moderate',
        physical_requirements: tour.physical_requirements || '',
        best_time_to_visit: tour.best_time_to_visit || '',
        weather_info: tour.weather_info || '',
        packing_list: tour.packing_list || [],
        languages_supported: tour.languages_supported || [],
        guide_included: tour.guide_included ?? true,
        guide_languages: tour.guide_languages || [],
        transportation_included: tour.transportation_included ?? true,
        transportation_details: tour.transportation_details || '',
        meals_included: tour.meals_included || [],
        dietary_restrictions_supported: tour.dietary_restrictions_supported || [],
        accommodation_type: tour.accommodation_type || '',
        accommodation_rating: tour.accommodation_rating,
        activity_types: tour.activity_types || [],
        interests: tour.interests || [],
        instant_booking: tour.instant_booking ?? false,
        requires_approval: tour.requires_approval ?? true,
        advance_booking_days: tour.advance_booking_days,
        is_active: tour.is_active ?? true,
        is_featured: tour.is_featured ?? true,
        is_customizable: tour.is_customizable ?? true,
        adults: tour.adults || 0,
        children: tour.children || 0,
        rooms: tour.rooms || 1,
        itinerary: ''
      },
      photos: tour.photos || [],
      reviews: tour.reviews || [],
      room_types: tour.room_types || [],
      itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : []
    };

    const dialogRef = this.dialog.open(EditTourComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: payload
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.tours.findIndex(t => t.id === result.tour.id);
        if (index !== -1) {
          this.tours[index] = {
            ...result.tour,
            photos: result.photos || [],
            reviews: result.reviews || [],
            room_types: result.room_types || [],
            itinerary: result.itinerary || [],
            showDetails: this.tours[index].showDetails ?? false,
            isDeleting: this.tours[index].isDeleting ?? false
          };
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
    this.isLoading = true;
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadTours();
  }

  // TrackBy function for ngFor performance
  trackByTourId(index: number, tour: Tour): number {
    return tour.id;
  }
}
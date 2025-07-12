import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddLocationComponent } from './add-location/add-location.component';
import { EditLocationComponent } from './edit-location/edit-location.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Destination } from '../../models/destination.model';
import { LocationModel } from '../../models/location.model';
import { LocationService } from '../../services/location/location.service';
import { DestinationService } from '../../services/destination/destination.service';
import { SafeUrlPipe } from '../../common/pipes/safe-url.pipe';
import { catchError, of, tap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, SafeUrlPipe],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent implements OnInit {
  // Properties
  locations: LocationModel[] = [];
  filteredLocations: LocationModel[] = [];
  paginatedLocations: LocationModel[] = [];
  destinations: Destination[] = [];
  isLoading: boolean = true;
  fallbackImage: string = 'https://via.placeholder.com/100x100?text=No+Image'; // Fallback image URL

  // Search and filter properties
  searchTerm: string = '';
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  // Modal properties
  showDeleteModal: boolean = false;
  locationToDelete: LocationModel | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private locationService: LocationService,
    private destinationService: DestinationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // Load locations and destinations data
  loadData(): void {
    this.isLoading = true;
    forkJoin([
      this.locationService.getAllLocations().pipe(
        tap((locations) => {
          this.validateImageUrls(locations);
        }),
        catchError((error) => {
          console.error('Error fetching locations:', error);
          return of([]);
        })
      ),
      this.destinationService.getDestinationNames().pipe(
        catchError((error) => {
          console.error('Error fetching destinations:', error);
          return of([]);
        })
      )
    ]).subscribe(([locations, destinations]) => {
      this.locations = locations;
      this.destinations = destinations;
      this.isLoading = false;
      this.applyFilters();
    });
  }

  // Validate image URLs and log issues
  validateImageUrls(locations: LocationModel[]): void {
    locations.forEach(location => {
      if (!location.image_url) {
        console.warn(`Image URL missing for location: ${location.name || 'ID ' + location.id}`);
        location.image_url = this.fallbackImage;
      } else {
        // Log URLs for debugging
        console.log(`Image URL for ${location.name}: ${location.image_url}`);
      }
    });
  }

  // Handle image loading errors
  handleImageError(location: LocationModel): void {
    console.error(`Failed to load image for ${location.name}: ${location.image_url}`);
    location.image_url = this.fallbackImage;
  }

  // Get destination name by ID
  getDestinationName(destinationId?: number): string {
    const destination = this.destinations.find(dest => dest.id === destinationId);
    return destination?.title || 'Unknown';
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  // Sort functionality
  onSort(): void {
    this.applyFilters();
  }

  // Toggle sort order
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // Apply filters, search, and sorting
  applyFilters(): void {
    // Filter locations based on search term
    this.filteredLocations = this.locations.filter(location =>
      location.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      this.getDestinationName(location.destination_id).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      location.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Sort locations
    this.filteredLocations.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (this.sortBy === 'name') {
        aValue = a.name!.toLowerCase();
        bValue = b.name!.toLowerCase();
      } else if (this.sortBy === 'destinationName') {
        aValue = this.getDestinationName(a.destination_id).toLowerCase();
        bValue = this.getDestinationName(b.destination_id).toLowerCase();
      } else {
        aValue = a.name!.toLowerCase();
        bValue = b.name!.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    this.updatePagination();
  }

  // Update pagination
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedLocations = this.filteredLocations.slice(startIndex, endIndex);
  }

  // Pagination methods
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
    return Math.ceil(this.filteredLocations.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
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
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredLocations.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  // Toggle location details
  toggleDetails(location: LocationModel): void {
    location.showDetails = !location.showDetails;
  }

  // TrackBy function for performance
  trackByLocationId(index: number, location: LocationModel): number {
    return location.id ?? index;
  }

  // Refresh locations
  refreshLocations(): void {
    this.loadData();
  }

  // Add location dialog
  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddLocationComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  // Edit location dialog
  openEditDialog(location: LocationModel): void {
    const dialogRef = this.dialog.open(EditLocationComponent, {
      width: '600px',
      data: { ...location }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.locations.findIndex(d => d.id === result.id);
        if (index !== -1) {
          this.locations[index] = result;
          this.applyFilters();
        }
      }
    });
  }

  // Delete location
  deleteLocation(location: LocationModel): void {
    this.locationToDelete = location;
    this.showDeleteModal = true;
  }

  // Confirm delete
  confirmDelete(): void {
    if (this.locationToDelete) {
      this.locationToDelete.isDeleting = true;
      this.locationService.deleteLocation(this.locationToDelete.id!).subscribe({
        next: () => {
          this.locations = this.locations.filter(loc => loc.id !== this.locationToDelete!.id);
          this.applyFilters();
          this.showDeleteModal = false;
          this.locationToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting location:', error);
          this.locationToDelete!.isDeleting = false;
          this.showDeleteModal = false;
          this.locationToDelete = null;
          alert('Failed to delete location. Please try again.');
        }
      });
    }
  }

  // Cancel delete
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.locationToDelete = null;
  }
}
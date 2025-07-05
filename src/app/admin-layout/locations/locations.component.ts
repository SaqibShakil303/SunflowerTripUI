import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddLocationComponent } from './add-location/add-location.component';
import { EditLocationComponent } from './edit-location/edit-location.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Destination } from '../../models/destination.model';

// Location interface
interface Location {
  id: number;
  name: string;
  destinationName: string;
  description: string;
  image: string;
  iframe360: SafeResourceUrl;
  showDetails?: boolean;
  isDeleting?: boolean;
}

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent implements OnInit {
  // Properties
  locations: Location[] = [];
  filteredLocations: Location[] = [];
  paginatedLocations: Location[] = [];

  // Search and filter properties
  searchTerm: string = '';
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  // Modal properties
  showDeleteModal: boolean = false;
  locationToDelete: Location | null = null;

  constructor(private sanitizer: DomSanitizer, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadLocations();
  }

  // Load initial locations data
  loadLocations(): void {
    // Sample data - replace with actual service call
    this.locations = [
      {
        id: 1,
        name: 'Paris',
        destinationName: 'France',
        description: 'The capital city of France, known for its iconic Eiffel Tower, rich history, art, and culture. Paris is famous for landmarks like the Louvre Museum and Notre-Dame Cathedral.',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        iframe360: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE1wT0xXb1p3Z0J0T1JSM2dWd0p3Z3p2d3p3Z3p3Z3p3Z3p3Z3p3!2m2!1d48.856614!2d2.3522219!3f0!4f0!5f0.7820865974627469'),
        showDetails: false,
        isDeleting: false
      },
      {
        id: 2,
        name: 'Rome',
        destinationName: 'Italy',
        description: 'The historic capital of Italy, home to ancient landmarks like the Colosseum and the Roman Forum. Rome is a treasure trove of art, architecture, and cuisine.',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=796&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        iframe360: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE9wRkVGd1BfRmhQWXpmdVBmM1lqSGQ3T0tBVUg2QzFnVGxYTExD!2m2!1d41.9027835!2d12.4963655!3f0!4f0!5f0.7820865974627469'),
        showDetails: false,
        isDeleting: false
      },
      {
        id: 3,
        name: 'Cusco',
        destinationName: 'South America',
        description: 'A city in Peru, gateway to the ancient Incan city of Machu Picchu. Cusco is known for its blend of Incan and Spanish colonial architecture and vibrant indigenous culture.',
        image: 'https://images.unsplash.com/photo-1589260133321-6d4cc4a4799e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        iframe360: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE9HQkRPX3dqQVVPYUZYY2JqZ0VUVHI2UlJZbEoxYzMwZ3pLd2lm!2m2!1d-13.531950!2d-71.9674626!3f0!4f0!5f0.7820865974627469'),
        showDetails: false,
        isDeleting: false
      },
      {
        id: 4,
        name: 'Sydney',
        destinationName: 'Australia',
        description: 'A vibrant city in Australia, famous for the Sydney Opera House and Sydney Harbour Bridge. It offers stunning beaches, cultural events, and a lively urban atmosphere.',
        image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        iframe360: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE9nN3NRX2s2eXNuTkJfNFVKNTY2WUVwOUhnQTNOQW5hWUdGR2lp!2m2!1d-33.8688197!2d151.2092955!3f0!4f0!5f0.7820865974627469'),
        showDetails: false,
        isDeleting: false
      },
      {
        id: 5,
        name: 'Rio de Janeiro',
        destinationName: 'Brazil',
        description: 'A dynamic city in Brazil, known for its Christ the Redeemer statue, Copacabana Beach, and vibrant Carnival celebrations. It blends natural beauty with cultural energy.',
        image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        iframe360: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE9nQkN5bWRFMXdoWmZmSHBNSkY2VW1nSGVMcThfY2FvVmcxcU1r!2m2!1d-22.9068467!2d-43.1728965!3f0!4f0!5f0.7820865974627469'),
        showDetails: false,
        isDeleting: false
      }
    ];

    this.applyFilters();
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
      location.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      location.destinationName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      location.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Sort locations
    this.filteredLocations.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (this.sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (this.sortBy === 'destinationName') {
        aValue = a.destinationName.toLowerCase();
        bValue = b.destinationName.toLowerCase();
      } else {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
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
  toggleDetails(location: Location): void {
    location.showDetails = !location.showDetails;
  }

  // TrackBy function for performance
  trackByLocationId(index: number, location: Location): number {
    return location.id;
  }

  // Refresh locations
  refreshLocations(): void {
    this.loadLocations();
  }

  // Add location dialog
  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddLocationComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add the destination

      }
    });
  }

  // Edit location dialog
  openEditDialog(location: Location): void {
      const dialogRef = this.dialog.open(EditLocationComponent, {
        width: '600px',
        data: { ...location } // Pass a copy of the location data
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Update the location in the destinations array
          const index = this.locations.findIndex(d => d.id === result.id);
          if (index !== -1) {
            this.locations[index] = result;
            this.applyFilters();
          }
        }
      });
    }

  // Delete location
  deleteLocation(location: Location): void {
    this.locationToDelete = location;
    this.showDeleteModal = true;
  }

  // Confirm delete
  confirmDelete(): void {
    if (this.locationToDelete) {
      this.locationToDelete.isDeleting = true;

      // Simulate API call with timeout
      setTimeout(() => {
        this.locations = this.locations.filter(loc => loc.id !== this.locationToDelete!.id);
        this.applyFilters();
        this.showDeleteModal = false;
        this.locationToDelete = null;
      }, 1000);
    }
  }

  // Cancel delete
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.locationToDelete = null;
  }
}
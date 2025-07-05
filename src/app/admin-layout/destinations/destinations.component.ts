import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddDestinationComponent } from './add-destination/add-destination.component';
import { EditDestinationComponent } from './edit-destination/edit-destination.component';
import { DestinationService } from '../../services/destination/destination.service';
import { Destination } from '../../models/destination.model';

interface UIDestination extends Destination {
  name: string;
  image: string;
  bestTime: string;
  languages: string[];
  continent?: string;
  showDetails?: boolean;
  isDeleting?: boolean;
}

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './destinations.component.html',
  styleUrl: './destinations.component.scss'
})
export class DestinationsComponent implements OnInit {
  searchTerm: string = '';
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  pageSize: number = 10;

  destinations: UIDestination[] = [];
  filteredDestinations: UIDestination[] = [];
  paginatedDestinations: UIDestination[] = [];

  showDeleteModal: boolean = false;
  destinationToDelete: UIDestination | null = null;

  constructor(private dialog: MatDialog, private destinationService: DestinationService) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  private loadDestinations(): void {
    this.destinationService.getDestinations().subscribe({
      next: (data) => {
        const idToTitleMap = new Map<number, string>();
        data.forEach(dest => idToTitleMap.set(dest.id, dest.title));

        this.destinations = data.map(dest => ({
          ...dest,
          name: dest.title,
          image: dest.image_url,
          bestTime: dest.best_time_to_visit,
          weather: dest.weather,
          currency: dest.currency,
     languages: dest.language ? dest.language.split(',').map(l => l.trim()) : [],

          timeZone: dest.time_zone,
          description: dest.description,
          continent: dest.parent_id ? idToTitleMap.get(dest.parent_id) || 'Unknown' : 'Root',
          showDetails: false,
          isDeleting: false
        }));
        this.applyFiltersAndSort();
      },
      error: (err) => {
        console.error('Failed to load destinations:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  onSort(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.onSort();
  }

  private applyFiltersAndSort(): void {
    this.filteredDestinations = this.destinations.filter(destination =>
      destination.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      destination.continent?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      destination.bestTime.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.filteredDestinations.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (this.sortBy) {
        case 'continent':
          aValue = a.continent || '';
          bValue = b.continent || '';
          break;
        case 'bestTime':
          aValue = a.bestTime;
          bValue = b.bestTime;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      const comparison = aValue.localeCompare(bValue);
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.updatePagination();
  }

  private updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDestinations = this.filteredDestinations.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredDestinations.length / this.pageSize);
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
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredDestinations.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  toggleDetails(destination: UIDestination): void {
    destination.showDetails = !destination.showDetails;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddDestinationComponent, { width: '600px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDestinations();
      }
    });
  }

  openEditDialog(destination: UIDestination): void {
    const dialogRef = this.dialog.open(EditDestinationComponent, {
      width: '600px',
      data: { ...destination }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.destinations.findIndex(d => d.id === result.id);
        if (index !== -1) {
          this.destinations[index] = result;
          this.applyFiltersAndSort();
        }
      }
    });
  }

  deleteDestination(destination: UIDestination): void {
    this.destinationToDelete = destination;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.destinationToDelete) {
      this.destinationToDelete.isDeleting = true;
      setTimeout(() => {
        if (this.destinationToDelete) {
          this.destinations = this.destinations.filter(d => d.id !== this.destinationToDelete!.id);
          this.applyFiltersAndSort();
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
    if (this.destinationToDelete) {
      this.destinationToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.destinationToDelete = null;
  }

  refreshDestinations(): void {
    this.loadDestinations();
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  trackByDestinationId(index: number, destination: UIDestination): number {
    return destination.id;
  }
}

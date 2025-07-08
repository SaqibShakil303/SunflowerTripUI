import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsService } from '../../services/bookings/bookings.service';
import { TripLead } from '../../models/tripLead.model';
import { TripPlannerService } from '../../services/TripPlanner/trip-planner.service';


@Component({
  selector: 'app-trip-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-leads.component.html',
  styleUrls: ['./trip-leads.component.scss']
})
export class TripLeadsComponent implements OnInit {
  tripLeads: TripLead[] = [];
  filteredTripLeads: TripLead[] = [];
  paginatedTripLeads: TripLead[] = [];
  searchTerm = '';
  sortBy: keyof TripLead = 'departure_date';
  sortOrder: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  pageSize = 10;
  showDeleteModal = false;
  leadToDelete: TripLead | null = null;
  errorMessage: string | null = null;

  constructor(private tripLeadService: TripPlannerService) {}

  ngOnInit(): void {
    this.loadTripLeads();
  }

  loadTripLeads(): void {
    this.tripLeadService.getAllTripLeads().subscribe({
      next: (data) => {
        this.tripLeads = data.map((lead: TripLead) => ({
          ...lead,
          isExpanded: false,
          isDeleting: false,
          aged_persons: lead.aged_persons ?? []
        }));
        this.applyFilters();
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to fetch trip leads';
        console.error('Failed to fetch trip leads', err);
      }
    });
  }

  deleteTripLead(lead: TripLead): void {
    this.leadToDelete = lead;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.leadToDelete) return;

    this.leadToDelete.isDeleting = true;
    this.tripLeadService.deleteTripLead(this.leadToDelete.id).subscribe({
      next: () => {
        this.tripLeads = this.tripLeads.filter(l => l.id !== this.leadToDelete!.id);
        this.applyFilters();
        this.cancelDelete();
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to delete trip lead';
        console.error('Delete failed', err);
        if (this.leadToDelete) {
          this.leadToDelete.isDeleting = false;
        }
      }
    });
  }

  cancelDelete(): void {
    if (this.leadToDelete) {
      this.leadToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.leadToDelete = null;
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
    let filtered = [...this.tripLeads];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        (lead.full_name?.toLowerCase().includes(term) || false) ||
        (lead.email?.toLowerCase().includes(term) || false) ||
        (lead.preferred_country?.toLowerCase().includes(term) || false)
      );
    }

    filtered.sort((a, b) => {
      let valueA: any = a[this.sortBy];
      let valueB: any = b[this.sortBy];

      if (this.sortBy === 'departure_date' || this.sortBy === 'return_date') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      } else {
        valueA = String(valueA ?? '').toLowerCase();
        valueB = String(valueB ?? '').toLowerCase();
      }

      return this.sortOrder === 'asc'
        ? valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        : valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    });

    this.filteredTripLeads = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTripLeads = this.filteredTripLeads.slice(startIndex, endIndex);
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
    return Math.ceil(this.filteredTripLeads.length / this.pageSize);
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
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredTripLeads.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  formatDate(date: Date | string | undefined): string {
    return date ? new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }) : 'Not specified';
  }

  formatTime(date: Date | string | undefined): string {
    return date ? new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : '';
  }

  trackByTripLeadId(index: number, lead: TripLead): number {
    return lead.id;
  }

  toggleExpanded(lead: TripLead): void {
    lead.isExpanded = !lead.isExpanded;
    console.log('Toggled isExpanded for trip lead:', lead.id, lead.isExpanded);
  }

  refreshTripLeads(): void {
    this.loadTripLeads();
  }

  exportTripLeads(): void {
    const headers = [
      'id', 'full_name', 'email', 'phone_number', 'preferred_country', 'preferred_city',
      'departure_date', 'return_date', 'number_of_days', 'number_of_adults',
      'number_of_children', 'number_of_male', 'number_of_female', 'number_of_other',
      'aged_persons', 'hotel_rating', 'meal_plan', 'room_type', 'need_flight',
      'departure_airport', 'trip_type', 'estimate_range'
    ];
    const rows = this.filteredTripLeads.map(lead =>
      headers.map(h => {
        if (h === 'departure_date' || h === 'return_date') {
          return `"${lead[h] ? this.formatDate(lead[h]) : ''}"`;
        }
        if (h === 'aged_persons') {
          return `"${JSON.stringify(lead[h] ?? [])}"`;
        }
        if (h === 'need_flight') {
          return `"${lead[h] ? 'Yes' : 'No'}"`;
        }
        return `"${lead[h as keyof TripLead] ?? ''}"`;
      }).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
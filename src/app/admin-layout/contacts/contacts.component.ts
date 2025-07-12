import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactModel } from '../../models/contact.model';
import { ContactService } from '../../services/contact/contact.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  contacts: ContactModel[] = [];
  filteredContacts: ContactModel[] = [];
  paginatedContacts: ContactModel[] = [];
  searchTerm = '';
  sortBy: keyof ContactModel = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  pageSize = 10;
  showDeleteModal = false;
  contactToDelete: ContactModel | null = null;
  errorMessage: string | null = null;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactService.getAllContactDetails().subscribe({
      next: (data) => {
        this.contacts = data.map((contact: any) => ({
          ...contact,
          created_at: contact.created_at ? new Date(contact.created_at) : new Date(),
          isDeleting: false,
          isExpanded: false
        }));
        this.applyFilters();
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to fetch contacts';
        console.error('Failed to fetch contacts', err);
      }
    });
  }

  deleteContact(contact: ContactModel): void {
    this.contactToDelete = contact;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.contactToDelete) return;

    this.contactToDelete.isDeleting = true;
    this.contactService.deleteContact(this.contactToDelete.id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(c => c.id !== this.contactToDelete!.id);
        this.applyFilters();
        this.cancelDelete();
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to delete contact';
        console.error('Delete failed', err);
        if (this.contactToDelete) {
          this.contactToDelete.isDeleting = false;
        }
      }
    });
  }

  cancelDelete(): void {
    if (this.contactToDelete) {
      this.contactToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.contactToDelete = null;
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
    let filtered = [...this.contacts];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        (contact.first_name?.toLowerCase().includes(term) || '') ||
        (contact.email?.toLowerCase().includes(term) || '') ||
        (contact.contact_id?.toLowerCase().includes(term) || '')
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

    this.filteredContacts = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedContacts = this.filteredContacts.slice(startIndex, endIndex);
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
    return Math.ceil(this.filteredContacts.length / this.pageSize);
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
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredContacts.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  formatTime(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  trackByContactId(index: number, contact: ContactModel): string | undefined {
    return contact.id;
  }

  toggleExpanded(contact: ContactModel): void {
    contact.isExpanded = !contact.isExpanded;
    console.log('Toggled isExpanded for contact:', contact.id, contact.isExpanded);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'pending';
    return status.toLowerCase().replace(' ', '-');
  }

  refreshContacts(): void {
    this.loadContacts();
  }

  exportContacts(): void {
    const headers = ['id', 'contact_id', 'first_name', 'email', 'phone_number', 'subject', 'message', 'created_at', 'status'];
    const rows = this.filteredContacts.map(contact =>
      headers.map(h => {
        if (h === 'created_at' && contact[h]) {
          return `"${this.formatDate(contact[h])} ${this.formatTime(contact[h])}"`;
        }
        return `"${contact[h as keyof ContactModel] ?? ''}"`;
      }).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// User interface
interface User {
  id: number;
  email: string;
  createdDate: Date;
  isDeleting?: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  // Data properties
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  
  // Search and filter properties
  searchTerm: string = '';
  sortBy: string = 'email';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  
  // Modal properties
  showDeleteModal: boolean = false;
  userToDelete: User | null = null;
  
  constructor() { }
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  /**
   * Load users data (mock data for now)
   */
  loadUsers(): void {
    // Mock data - replace with actual service call
    this.users = [
      { id: 1, email: 'john.doe@example.com', createdDate: new Date('2024-01-15T10:30:00') },
      { id: 2, email: 'jane.smith@example.com', createdDate: new Date('2024-01-20T14:45:00') },
      { id: 3, email: 'alice.johnson@example.com', createdDate: new Date('2024-02-01T09:15:00') },
      { id: 4, email: 'bob.wilson@example.com', createdDate: new Date('2024-02-10T16:20:00') },
      { id: 5, email: 'carol.brown@example.com', createdDate: new Date('2024-02-15T11:30:00') },
      { id: 6, email: 'david.taylor@example.com', createdDate: new Date('2024-03-01T13:45:00') },
      { id: 7, email: 'eva.martinez@example.com', createdDate: new Date('2024-03-05T08:20:00') },
      { id: 8, email: 'frank.anderson@example.com', createdDate: new Date('2024-03-10T15:10:00') },
      { id: 9, email: 'grace.thomas@example.com', createdDate: new Date('2024-03-15T12:25:00') },
      { id: 10, email: 'henry.jackson@example.com', createdDate: new Date('2024-03-20T17:40:00') },
      { id: 11, email: 'ivy.white@example.com', createdDate: new Date('2024-04-01T10:15:00') },
      { id: 12, email: 'jack.harris@example.com', createdDate: new Date('2024-04-05T14:30:00') },
      { id: 13, email: 'kelly.clark@example.com', createdDate: new Date('2024-04-10T09:45:00') },
      { id: 14, email: 'liam.lewis@example.com', createdDate: new Date('2024-04-15T16:00:00') },
      { id: 15, email: 'mia.robinson@example.com', createdDate: new Date('2024-04-20T11:20:00') }
    ];
    
    this.applyFiltersAndSort();
  }
  
  /**
   * Apply search, sort, and pagination
   */
  applyFiltersAndSort(): void {
    // Apply search filter
    if (this.searchTerm.trim()) {
      this.filteredUsers = this.users.filter(user =>
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredUsers = [...this.users];
    }
    
    // Apply sorting
    this.filteredUsers.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (this.sortBy) {
        case 'email':
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case 'createdDate':
          valueA = a.createdDate.getTime();
          valueB = b.createdDate.getTime();
          break;
        case 'serialNumber':
          valueA = a.id;
          valueB = b.id;
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
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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
   * Refresh users data
   */
  refreshUsers(): void {
    this.loadUsers();
    console.log('Users refreshed');
  }
  
  /**
   * Export users data
   */
  exportUsers(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    console.log('Users exported');
  }
  
  /**
   * Generate CSV content
   */
  private generateCSV(): string {
    const headers = ['Serial Number', 'Email', 'Created Date'];
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    this.filteredUsers.forEach((user, index) => {
      const row = [
        index + 1,
        `"${user.email}"`,
        `"${this.formatDate(user.createdDate)} ${this.formatTime(user.createdDate)}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
  
  /**
   * Delete user (show confirmation modal)
   */
  deleteUser(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }
  
  /**
   * Confirm delete user
   */
  confirmDelete(): void {
    if (this.userToDelete) {
      // Set deleting state
      this.userToDelete.isDeleting = true;
      
      // Simulate API call delay
      setTimeout(() => {
        // Remove user from array
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        
        // Reset modal state
        this.showDeleteModal = false;
        this.userToDelete = null;
        
        // Refresh the display
        this.applyFiltersAndSort();
        
        console.log('User deleted successfully');
      }, 1500); // 1.5 second delay to show loading state
    }
  }
  
  /**
   * Cancel delete operation
   */
  cancelDelete(): void {
    if (this.userToDelete) {
      this.userToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.userToDelete = null;
  }
  
  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(date);
  }
  
  /**
   * Format time for display
   */
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
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
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
  
  // Pagination methods
  
  /**
   * Get total number of pages
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
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
    return Math.min(endIndex, this.filteredUsers.length);
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
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}
import { Component, OnInit } from '@angular/core';
import { tap, catchError, of, timeout } from 'rxjs';
import { JobModel } from '../../models/job.model';
import { JobService } from '../../services/job/job.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddJobComponent } from './add-job/add-job.component';
import { EditJobComponent } from './edit-job/edit-job.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent implements OnInit {
  // Properties
  jobs: JobModel[] = [];
  filteredJobs: JobModel[] = [];
  paginatedJobs: JobModel[] = [];
  isLoading: boolean = true;

  // Search and filter properties
  searchTerm: string = '';
  sortBy: string = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  // Modal properties
  showDeleteModal: boolean = false;
  jobToDelete: JobModel | null = null;

  constructor(
    private dialog: MatDialog,
    private jobService: JobService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // Load jobs data
  loadData(): void {
    this.isLoading = true;
    this.jobService.getAllJobs().pipe( timeout(8000),
      tap((jobs) => {
        console.log('Fetched jobs:', jobs);
      }),
      catchError((error) => {
        console.error('Error fetching jobs:', error);
        return of([]);
      })
    ).subscribe((jobs) => {
      this.jobs = jobs.map(job => ({
        ...job,
        showDetails: false,
        isDeleting: false
      }));
      this.isLoading = false;
      this.applyFilters();
    });
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
    // Filter jobs based on search term
    this.filteredJobs = this.jobs.filter(job =>
      (job.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
      (job.department?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
      (job.location?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
      (job.type?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
      (job.status?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false)
    );

    // Sort jobs
    this.filteredJobs.sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (this.sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'department':
          aValue = a.department?.toLowerCase() || '';
          bValue = b.department?.toLowerCase() || '';
          break;
        case 'location':
          aValue = a.location?.toLowerCase() || '';
          bValue = b.location?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.type?.toLowerCase() || '';
          bValue = b.type?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        default:
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
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
    this.paginatedJobs = this.filteredJobs.slice(startIndex, endIndex);
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
    return Math.ceil(this.filteredJobs.length / this.pageSize);
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
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredJobs.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  // Toggle job details
  toggleDetails(job: JobModel): void {
    job.showDetails = !job.showDetails;
  }

  // TrackBy function for performance
  trackByJobId(index: number, job: JobModel): number {
    return job.id ?? index;
  }

  // Refresh jobs
  refreshJobs(): void {
    this.loadData();
  }

  // Add job dialog
  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddJobComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  // Edit job dialog
  openEditDialog(job: JobModel): void {
    const dialogRef = this.dialog.open(EditJobComponent, {
      width: '600px',
      data: { ...job }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.jobs.findIndex(j => j.id === result.id);
        if (index !== -1) {
          this.jobs[index] = {
            ...result,
            showDetails: this.jobs[index].showDetails ?? false,
            isDeleting: this.jobs[index].isDeleting ?? false
          };
          this.applyFilters();
        }
      }
    });
  }

  // Delete job
  deleteJob(job: JobModel): void {
    this.jobToDelete = job;
    this.showDeleteModal = true;
  }

  // Confirm delete
  confirmDelete(): void {
    if (this.jobToDelete) {
      this.jobToDelete.isDeleting = true;
      this.jobService.deleteJob(this.jobToDelete.id!).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== this.jobToDelete!.id);
          this.applyFilters();
          this.showDeleteModal = false;
          this.jobToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting job:', error);
          this.jobToDelete!.isDeleting = false;
          this.showDeleteModal = false;
          this.jobToDelete = null;
          alert('Failed to delete job. Please try again.');
        }
      });
    }
  }

  // Cancel delete
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.jobToDelete = null;
  }
}
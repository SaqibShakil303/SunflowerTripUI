import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItineraryService } from '../../services/itinerary/itinerary.service';
import { Itinerary } from '../../models/itinerary.model';
import { catchError, of, tap, timeout } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Extend interface to include isDeleting and showDetails
interface ExtendedItinerary extends Itinerary {
  isDeleting?: boolean;
  isSending?: boolean;
  showDetails?: boolean;
}

@Component({
  selector: 'app-enquiry-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './enquiry-details.component.html',
  styleUrl: './enquiry-details.component.scss'
})
export class EnquiryDetailsComponent implements OnInit {
  itineraryForm!: FormGroup;
  // Data properties
  itineraries: ExtendedItinerary[] = [];
  filteredItineraries: ExtendedItinerary[] = [];
  paginatedItineraries: ExtendedItinerary[] = [];
  error: string | null = null;
  selectedFile: any | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  showPreview: boolean = false

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

  // send itinerary Modal properties
  showSendItineraryModal: boolean = false;
  itineraryToBeSent: ExtendedItinerary | null = null;

  constructor(
    private fb: FormBuilder,
    private itineraryService: ItineraryService, 
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadItineraries();
  }

  /**
   * Load itineraries data from service
   */
  loadItineraries(): void {
    this.itineraryService.getItineraries().pipe( timeout(8000),
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
         valueA = a.created_at ? new Date(a.created_at).getTime() : 0;
      valueB = b.created_at ? new Date(b.created_at).getTime() : 0;
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
    this.searchTerm = '';
    this.loadItineraries();
    // console.log('Itineraries refreshed');
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
    const headers = [
      'Serial Number',
      'Name',
      'Phone',
      'Email',
      'Destination',
      'Travelers',
      'Children',
      'Child Ages',
      'Duration',
      'Travel Date',
      'Created At',
      'Budget',
      'Hotel Category',
      'Travel Type',
      'occupation',
      'Preferences'
    ];

    const csvRows: string[] = [];

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
        `"${this.formatDate(itinerary.created_at)} ${this.formatTime(itinerary.created_at)}"`,
        `"${itinerary.budget}"`,
        `"${itinerary.hotel_category}"`,
        `"${itinerary.travel_type}"`,
        `"${itinerary.occupation}"`,
        `"${itinerary.preferences}"`
      ];

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

   isFieldInvalid(control: FormGroup | FormArray, fieldName: string): boolean {
      const field = control.get(fieldName);
      return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(control: FormGroup | FormArray, fieldName: string): string {
    const field = control.get(fieldName);
    if (field?.errors) {
      if (field.errors['required'])
        return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength'])
        return `${this.getFieldLabel(fieldName)} must have at least ${
          field.errors['minlength'].requiredLength
        } selection(s)`;
      if (field.errors['maxlength'])
        return `${this.getFieldLabel(fieldName)} must not exceed ${
          field.errors['maxlength'].requiredLength
        } characters`;
      if (field.errors['min'])
        return `${this.getFieldLabel(fieldName)} must be at least ${
          field.errors['min'].min
        }`;
      if (field.errors['max'])
        return `${this.getFieldLabel(fieldName)} must not exceed ${
          field.errors['max'].max
        }`;
      if (field.errors['pattern'])
        return `${this.getFieldLabel(
          fieldName
        )} must contain only lowercase letters, numbers, and hyphens`;
      if (field.errors['invalidType'])
        return 'Please select a valid image (PNG, JPG, JPEG, or WebP)';
      if (field.errors['readError']) return 'Error reading the image file';
    }
    return '';
  }

   private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'email',
      confirmEmail: 'confirmEmail',
      itineraryFile: 'itineraryFile',
    };
    return (
      labels[fieldName] ||
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );
  }


  sendItinerary(itinerary: ExtendedItinerary):void {
    this.itineraryToBeSent = itinerary;
    this.showSendItineraryModal = true;

    if(this.showSendItineraryModal) {
      this.itineraryForm = this.fb.group({
        customerName: this.itineraryToBeSent.name,
        destination: this.itineraryToBeSent.destination,
        phone: this.itineraryToBeSent.phone,
        email: [
          this.itineraryToBeSent.email,
          [
            Validators.required, 
          ],
        ],
        confirmEmail: [
          '',
          [
            Validators.required,
          ],
        ],
        itineraryFile: [null, [Validators.required]]
      });
    }
  }

  cancelSendItinerary(): void {
    if (this.itineraryToBeSent) {
      this.itineraryToBeSent.isSending = false;
    }
    this.showSendItineraryModal = false;
    this.itineraryToBeSent = null;
    this.pdfUrl = null;
    this.selectedFile = null;
    this.showPreview = false;
  }

  onSubmit() {
    if(this.itineraryForm.valid){
      this.confirmSend()
    } else {
      if(this.itineraryToBeSent !== null) this.itineraryToBeSent.isSending = false;
    }
  }

  handleFileUpload(event: any) {
  const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      // Create PDF Preview URL
      const blobUrl = URL.createObjectURL(file);
      // FIX: sanitize blob URL
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    }
  }

  confirmSend(): void {
    if(this.itineraryToBeSent !== null && typeof this.itineraryToBeSent.id === 'number') {
      const formData = new FormData();
      formData.append('email', this.itineraryForm.get('email')?.value);
      formData.append('confirmEmail', this.itineraryForm.get('confirmEmail')?.value);
      formData.append('itineraryFile', this.selectedFile); // IMPORTANT
      formData.append('customerName', this.itineraryForm.get('customerName')?.value);
      formData.append('destination', this.itineraryForm.get('destination')?.value);
      formData.append('phone', this.itineraryForm.get('phone')?.value);
      this.itineraryToBeSent.isSending = true;
      this.itineraryService.sendItinerary(this.itineraryToBeSent.id, formData).subscribe({
        next: () => {
          this.snackBar.open('Itinerary send successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          
          this.itineraryToBeSent = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to send itinerary: ' + (err.error?.message || 'Unknown error'),
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
          this.itineraryToBeSent = null;
          this.cdr.detectChanges();
          this.cancelSendItinerary();
        },
        complete: () => {
          this.itineraryToBeSent = null;
          this.cdr.detectChanges();
          this.cancelSendItinerary();
          // this.loadItineraries();
        }
      })
    } else {
      this.snackBar.open(
            'Failed to send itinerary: Unknown error',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
    }
  }

  openPreview() {
  this.showPreview = true;
}

closePreview() {
  this.showPreview = false;
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
      this.itineraryService.deleteItinerary(this.itineraryToDelete.id!).pipe( timeout(8000),
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
  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';                               // no value

    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';                  // invalid date

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(d);
  }

  /**
   * Format time for display
   */
  formatTime(date: string | Date | null | undefined): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
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
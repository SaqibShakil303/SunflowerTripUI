import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Faq, FaqService } from '../../services/faq/faq.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AddFaqComponent } from './add-faq/add-faq.component';
import { EditFaqComponent } from './edit-faq/edit-faq.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    NgFor,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    NgIf,
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements OnInit {
  // Data arrays
  allFaqs = signal<Faq[]>([]);
  filteredFaqs = signal<Faq[]>([]);
  paginatedFaqs = signal<Faq[]>([]);

  // Search and filtering
  searchTerm: string = '';

  // Sorting
  sortBy: string = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  // Modal state
  showDeleteModal: boolean = false;
  faqToDelete: Faq | null = null;
  isLoading: boolean = true;

  // request
  isSubmitting = false;

  constructor(
    private faqService: FaqService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.faqService.getAllFaqs().subscribe({
      next: (data: any) => {
        const newFaqs = data.data.map((faq: Faq) => {
          return { ...faq, isDeleting: false };
        });
        this.allFaqs.set(newFaqs);
        this.filteredFaqs.set(newFaqs);
      },
      error: (err) => console.log('error while fetching all faqs:: ', err),
      complete: () => {
        // console.log('all faqs fetched successfully: ', this.allFaqs());
      },
    });
    this.isLoading = false;
  }

  getFaqId(index: number, faq: Faq): number {
    return faq.id;
  }
  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }
  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddFaqComponent, {
      width: '800px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe({ complete: () => this.loadFaqs() });
  }

  openEditDialog(faq: Faq): void {
    const dialogRef = this.dialog.open(EditFaqComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
      },
    });

    dialogRef.afterClosed().subscribe({ complete: () => this.loadFaqs() });
  }

    confirmDeletePrompt(faq: Faq): void  {
    this.faqToDelete = faq;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.faqToDelete) {
      this.faqToDelete.isDeleting = true;

      this.faqService.deleteFaq(this.faqToDelete.id).subscribe({
        next: () => {
          this.snackBar.open('FAQ deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.cdr.detectChanges();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error deleting tour:', err);
          this.cancelDelete();
        },
        complete: () => {
          this.isSubmitting = false;
          this.cancelDelete();
          this.loadFaqs();
        },
      });
    }
  }

  cancelDelete(): void {
    if (this.faqToDelete) {
      this.faqToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.faqToDelete = null;
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.filteredFaqs.set(
        this.allFaqs().filter((faq: Faq) => {
          return (
            faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            faq.question.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
        })
      );
    } else {
      this.filteredFaqs.set([...this.allFaqs()]);
    }
  }

  refreshFaqs(): void {
    this.isLoading = true;
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadFaqs();
  }
}

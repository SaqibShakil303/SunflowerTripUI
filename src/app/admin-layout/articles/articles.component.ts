import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import {
  Article,
  ArticleService,
} from '../../services/article/article.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddArticleComponent } from './add-article/add-article.component';
import { EditArticleComponent } from './edit-article/edit-article.component'; 

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    NgFor,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    NgIf,
    NgClass,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
})
export class ArticlesComponent implements OnInit {
  allArticles = signal<Article[]>([]);
  filteredArticles = signal<Article[]>([]);
  paginatedArticles = signal<Article[]>([]);

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
  articleToDelete: Article | null = null;
  isLoading: boolean = true;

  // request
  isSubmitting = false;

  constructor(
    private articleService: ArticleService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.articleService.getAllArticles().subscribe({
      next: (data: any) => {
        const newArticles = data.data.map((article: Article) => {
          return { ...article, isDeleting: false, showMore: false };
        });
        this.allArticles.set(newArticles);
        this.filteredArticles.set(newArticles);
        this.applyPagination();
      },
      error: (err) => console.log('error while loading articles:: ', err),
      // complete: () => console.log(this.allArticles()),
    });
    this.isLoading = false;
  }

  refreshArticles(): void {
    this.searchTerm = '';
    this.loadArticles();
  }

  onSearch(): Article[] {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) return this.allArticles();
    return this.allArticles().filter((a: Article) => {
      return (
        (a.title && a.title.toLowerCase().includes(term)) ||
        (a.content && a.content.toLowerCase().includes(term)) ||
        (a.author && a.author.toLowerCase().includes(term)) ||
          (a.meta_title && a.meta_title.toLowerCase().includes(term)) ||
            (a.meta_description && a.meta_description.toLowerCase().includes(term)) ||
        (a.category && a.category.toLowerCase().includes(term)) ||
        (a.status && a.status.toLowerCase().includes(term))
      );
    });
  }

  handleSearch(): void {
    this.filteredArticles.set(this.onSearch());
  }

  getSerialNumber(index: number): number {
    // if you use pagination later, adjust this to include page offset
    return index + 1;
  }

  getArticleId(index: number, item: Article): number {
    return item.id;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddArticleComponent, {
      width: '800px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (!result) return;
        if (result.cancelled) return;
        if (result.addArticle) {
          // console.log(result.addArticle)
          this.articleService.addArticle(result.addArticle).subscribe({
            next: () => {
              this.snackBar.open('Article created successfully', 'Close', {
                duration: 3000,
              });
              this.loadArticles();
            },
            error: (err) => {
              console.error('Error adding article:', err);
              this.snackBar.open('Failed to create article', 'Close', {
                duration: 3000,
              });
            },
          });
          return;
        }
      },
      complete: () => this.loadArticles(),
    });
  }

  openEditDialog(article: Article): void {
    const dialogRef = this.dialog.open(EditArticleComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        ...article,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (!result) return;
        if (result.cancel) return;
        if (result.save) {
          const id = result.save.id;
          const payload = { ...result.save };

          this.articleService.editArticle(id, payload).subscribe({
            next: () => {
              this.snackBar.open('Article updated successfully', 'Close', {
                duration: 3000,
              });
              this.loadArticles();
            },
            error: (err) => {
              console.error('Error updating article:', err);
              this.snackBar.open('Failed to update article', 'Close', {
                duration: 3000,
              });
            },
          });
        }
      },
      complete: () => this.loadArticles(),
    });
  }

  confirmDeletePrompt(article: Article): void {
    this.articleToDelete = article;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    if (this.articleToDelete) {
      this.articleToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.articleToDelete = null;
  }

  deleteArticle(article: Article): void {
    this.articleToDelete = article;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.articleToDelete) return;
    const a = this.articleToDelete;
    a.isDeleting = true;

    this.articleService.deleteArticle(this.articleToDelete?.id).subscribe({
      next: () => {
        this.snackBar.open('Article deleted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.cdr.detectChanges();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error deleting article:', err);
        this.cancelDelete();
      },
      complete: () => {
        this.isSubmitting = false;
        this.cancelDelete();
        this.loadArticles();
      },
    });
  }

  showContent(article: Article) {
    article.showMore = !article.showMore;
  }

  /**
   * Update pagination
   */
  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedArticles.set(this.filteredArticles().slice(startIndex, endIndex));
  }

  // Utility to truncate long content for table cell preview
  truncate(text: string | undefined | null, length = 120): string {
    if (!text) return 'N/A';
    return text.length > length ? text.slice(0, length) + '…' : text;
  }

  // utility to determine badge class
  statusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'published':
        return 'badge-success';
      case 'draft':
        return 'badge-warning';
      case 'archived':
        return 'badge-inactive';
      default:
        return 'badge-inactive';
    }
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
    return Math.min(endIndex, this.filteredArticles().length);
  }

   /**
   * Get total number of pages
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredArticles().length / this.pageSize);
  }

   /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
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

   /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.applyPagination();
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';

export interface ArticlePayload {
  title: string;
  slug: string;
  content: string;
  cover_image?: string | null;
  author: string;
  category?: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at?: string | null;
   meta_title?: string;
  meta_description?: string;
}

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.scss'],
})
export class AddArticleComponent implements OnInit {
  @Input() initial?: Partial<ArticlePayload>;
  @Output() addArticle = new EventEmitter<ArticlePayload>();
  @Output() cancelled = new EventEmitter<void>();

  articleForm!: FormGroup;
  isSubmitting = false;

  // UX limits
  readonly TITLE_MAX = 255;
  readonly CONTENT_MAX = 10000;
  readonly AUTHOR_MAX = 150;
  readonly CATEGORY_MAX = 150;
  readonly META_TITLE_MAX = 70;
  readonly META_DES_MAX = 320;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddArticleComponent>
  ) {}

  ngOnInit(): void {
    this.articleForm = this.fb.group({
      title: [
        this.initial?.title || '',
        [Validators.required, Validators.maxLength(this.TITLE_MAX)],
      ],
      content: [
        this.initial?.content || '',
        [Validators.required, Validators.maxLength(this.CONTENT_MAX)],
      ],
      status: [this.initial?.status || 'draft', [Validators.required]],
      author: [
        this.initial?.author || '',
        [Validators.required, Validators.maxLength(this.AUTHOR_MAX)],
      ],
         meta_title: [
        this.initial?.meta_title || '',
        [Validators.required, Validators.maxLength(this.META_TITLE_MAX)],
      ],
         meta_description: [
        this.initial?.meta_description || '',
        [Validators.required, Validators.maxLength(this.META_DES_MAX)],
      ],
      category: [
        this.initial?.category || '',
        [Validators.maxLength(this.CATEGORY_MAX)],
      ],
      cover_image: [this.initial?.cover_image || ''],
    });
  }

  // Helpers for template
  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'This field is required.';
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed.`;
    // add more rules here if needed
    return 'Invalid field.';
  }

  clearForm(): void {
    this.articleForm.reset({
      title: '',
      content: '',
      status: 'draft',
      author: '',
      category: '',
      cover_image: '',
      meta_title:'',
      meta_description:''
    });
    // mark pristine
    this.articleForm.markAsPristine();
    this.articleForm.markAsUntouched();
  }

  onCancel(): void {
    if (this.isSubmitting) return;
    this.dialogRef.close({ cancelled: true });
  }

  // Basic slug generator (keeps things simple)
  private generateSlug(title: string) {
    return String(title || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-{2,}/g, '-')
      .replace(/^\-+|\-+$/g, '');
  }

  async onSubmit(): Promise<void> {
    if (this.articleForm.invalid || this.isSubmitting) {
      Object.values(this.articleForm.controls).forEach((c) =>
        c.markAsTouched()
      );
      return;
    }

    this.isSubmitting = true;

    try {
      const v = this.articleForm.value;

      const payload: ArticlePayload = {
        title: v.title.trim(),
        slug: this.generateSlug(v.title),
        content: v.content.trim(),
        cover_image: v.cover_image || null,
        author: v.author.trim(),
        category: v.category ? v.category.trim() : null,
        status: v.status,
        published_at:
          v.status === 'published'
            ? new Date().toISOString().slice(0, 19).replace('T', ' ')
            : null,
            meta_title:v.meta_title,
            meta_description:v.meta_description
      };

      this.dialogRef.close({ addArticle: payload });
    } finally {
      this.isSubmitting = false;
    }
  }
}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Article } from '../../../services/article/article.service';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.scss'],
})
export class EditArticleComponent implements OnInit {
  @Input() article: Article | null = null; // pass existing article object to edit
  @Output() save = new EventEmitter<Article>();
  @Output() cancel = new EventEmitter<void>();

  articleForm!: FormGroup;
  isSubmitting = false;

  // UX limits
  readonly TITLE_MAX = 255;
  readonly CONTENT_MAX = 10000;
  readonly AUTHOR_MAX = 150;
  readonly CATEGORY_MAX = 150;
    readonly META_TITLE_MAX = 70;
  readonly META_DES_MAX = 320;

  // default statuses consistent with DB ENUM
  statuses = ['draft', 'published', 'archived'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditArticleComponent>,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: Article
  ) {}

  ngOnInit(): void {
    this.articleForm = this.fb.group({
      title: [
        this.article?.title || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      content: [this.article?.content || '', [Validators.required]],
      status: [this.article?.status || 'draft', [Validators.required]],
      author: [
        this.article?.author || '',
        [Validators.required, Validators.maxLength(150)],
      ],
       meta_title:[
        this.article?.meta_title || '',
        [Validators.required, Validators.maxLength(70)],
      ],
  meta_description:[
        this.article?.meta_description || '',
        [Validators.required, Validators.maxLength(320)],
      ],
      category: [this.article?.category || ''],
      cover_image: [this.article?.cover_image || ''],
    });
    this.populateForm();
  }

  isFieldInvalid(form: FormGroup, field: string) {
    const control = form.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  private populateForm(): void {
    this.articleForm.patchValue({
      title: this.data.title,
      content: this.data.content,
      author: this.data.author,
       meta_title: this.data.meta_title,
  meta_description:this.data.meta_description,
      category: this.data.category,
      status: this.data.status,
      cover_image: this.data.cover_image,
    });
  }

  getFieldError(form: FormGroup, field: string) {
    const control = form.get(field);
    if (!control || !control.errors) return null;
    if (control.errors['required']) return 'This field is required';
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed`;
    return 'Invalid field';
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

  onSubmit() {
    this.articleForm.markAllAsTouched();
    if (this.articleForm.invalid) return;

    this.isSubmitting = true;

    try {
      // Build article payload
      const formVal: Article = { ...this.articleForm.value, id: this.data.id };
      const payload: Article = {
        id: formVal.id,
        title: formVal.title,
        slug: this.generateSlug(formVal.title),
        content: formVal.content,
        author: formVal.author,
           meta_title: formVal.meta_title,
              meta_description: formVal.meta_description,
        category: formVal.category,
        status: formVal.status,
        cover_image: formVal.cover_image,
      };

      this.dialogRef.close({ save: payload });
    } finally {
      this.isSubmitting = false;
    }
  }

  clearForm() {
    this.articleForm.reset({
      title: '',
      content: '',
      status: 'draft',
      author: '',
      meta_title:'',
      meta_description:'',
      category: '',
      cover_image: '',
    });
  }

  onCancel() {
    if (this.isSubmitting) return;
    this.dialogRef.close({ cancel: true });
  }
}

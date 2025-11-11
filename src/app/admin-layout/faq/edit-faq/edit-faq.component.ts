import { ChangeDetectorRef, Component, Inject, inject } from '@angular/core';
import {
  FormArray,
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
import { FaqService } from '../../../services/faq/faq.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

export interface FaqPayload {
  id: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-edit-faq',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit-faq.component.html',
  styleUrl: './edit-faq.component.scss',
})
export class EditFaqComponent {
  faqForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditFaqComponent>,
    private faqService: FaqService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: FaqPayload
  ) {}
  ngOnInit(): void {
    this.faqForm = this.fb.group({
      question: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      answer: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });
    this.populateForm();
  }
  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.faqForm.valid) {
      const formData = { ...this.faqForm.value, id: this.data.id };
      console.log(formData);
      this.faqService.editFaq(formData).subscribe({
        next: (result) => {
          this.snackBar.open('FAQ updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.dialogRef.close(result);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.snackBar.open(
            'Failed to update faq: ' + (err.error?.message || 'Unknown error'),
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
          this.cdr.detectChanges();
        },
      });
    } else {
      Object.keys(this.faqForm.controls).forEach((key) => {
        const control = this.faqForm.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach((c: any) => {
            Object.keys(c.controls).forEach((subKey) => {
              c.get(subKey)?.markAsTouched();
            });
          });
        } else {
          control?.markAsTouched();
        }
      });
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      this.cdr.detectChanges();
    }
  }

  private populateForm(): void {
    this.faqForm.patchValue({
      question: this.data.question,
      answer: this.data.answer,
    });
  }

  clearForm() {
    this.faqForm.reset();
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
      question: 'question',
      answer: 'answer',
      category: 'category',
    };
    return (
      labels[fieldName] ||
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );
  }
}

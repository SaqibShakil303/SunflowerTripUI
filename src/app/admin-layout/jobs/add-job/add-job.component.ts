import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ɵInternalFormsSharedModule, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JobModel } from '../../../models/job.model';
import { JobService } from '../../../services/job/job.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './add-job.component.html',
  styleUrl: './add-job.component.scss'
})
export class AddJobComponent {
  jobForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddJobComponent>,
    private jobService: JobService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.jobForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      department: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      location: ['', [Validators.maxLength(100)]],
      type: ['', [Validators.required]],
      status: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      requirements: ['', [Validators.maxLength(1000)]],
      responsibilities: ['', [Validators.maxLength(1000)]],
      salary_range: ['', [Validators.maxLength(50)]],
      experience_required: ['', [Validators.maxLength(50)]],
      application_deadline: ['']
    });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.jobForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.jobForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Job title',
      department: 'Department',
      location: 'Location',
      type: 'Job type',
      status: 'Status',
      description: 'Description',
      requirements: 'Requirements',
      responsibilities: 'Responsibilities',
      salary_range: 'Salary range',
      experience_required: 'Experience required',
      application_deadline: 'Application deadline'
    };
    return labels[fieldName] || fieldName;
  }

  // Form submission
  onSubmit(): void {
    if (this.jobForm.valid) {
      this.isSubmitting = true;

      const formValue = this.jobForm.value;
      const jobData: Partial<JobModel> = {
        title: formValue.title,
        department: formValue.department,
        location: formValue.location,
        type: formValue.type,
        status: formValue.status,
        description: formValue.description,
        requirements: formValue.requirements,
        responsibilities: formValue.responsibilities,
        salary_range: formValue.salary_range,
        experience_required: formValue.experience_required,
        application_deadline: formValue.application_deadline || null
      };

      this.jobService.addJob(jobData).subscribe({
        next: (result) => {
          this.snackBar.open('Job added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isSubmitting = false;
          this.dialogRef.close(result);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open('Failed to add job: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      Object.keys(this.jobForm.controls).forEach(key => {
        this.jobForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.cdr.detectChanges();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

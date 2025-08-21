import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { JobModel } from '../../../models/job.model';
import { JobService } from '../../../services/job/job.service';

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './edit-job.component.html',
  styleUrl: './edit-job.component.scss'
})
export class EditJobComponent {
jobForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditJobComponent>,
    private jobService: JobService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: JobModel
  ) {
    this.jobForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
    this.cdr.detectChanges();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null, [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      department: ['', [Validators.maxLength(100)]],
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

  private populateForm(): void {
    const { id, title, department, location, type, status, description, requirements, responsibilities, salary_range, experience_required, application_deadline } = this.data;

    this.jobForm.patchValue({
      id,
      title,
      department,
      location,
      type,
      status,
      description,
      requirements,
      responsibilities,
      salary_range,
      experience_required,
      application_deadline
    });
    this.cdr.detectChanges();
  }

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
      id: 'ID',
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

  onSubmit(): void {
    if (this.jobForm.valid) {
      this.isSubmitting = true;

      const formValue = this.jobForm.value;
      const jobData: Partial<JobModel> = {
        id: formValue.id,
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

      this.jobService.updateJob(jobData).subscribe({
        next: (updatedJob) => {
          this.snackBar.open('Job updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isSubmitting = false;
          this.dialogRef.close(updatedJob);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage = error.error?.message || error.message || 'Unknown server error';
          this.snackBar.open(`Failed to update job: ${errorMessage}`, 'Close', {
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

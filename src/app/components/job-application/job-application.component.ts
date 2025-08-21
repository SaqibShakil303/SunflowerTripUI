import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../services/job/job.service';
import { ApplicationModel, JobModel } from '../../models/job.model';

@Component({
  selector: 'app-job-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-application.component.html',
  styleUrl: './job-application.component.scss'
})
export class JobApplicationComponent {
  applicationForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<JobApplicationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: JobModel },
    private fb: FormBuilder,
    private jobService: JobService
  ) {
    this.applicationForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(20)]],
      resume_url: ['', [Validators.maxLength(255)]],
      cover_letter: ['', [Validators.maxLength(5000)]]
    });
  }

  get formErrors() {
    const errors: { [key: string]: string } = {};
    const controls = this.applicationForm.controls;

    if (controls['name'].touched && controls['name'].errors) {
      if (controls['name'].errors['required']) errors['name'] = 'Full name is required';
      if (controls['name'].errors['maxlength']) errors['name'] = 'Name cannot exceed 100 characters';
    }
    if (controls['email'].touched && controls['email'].errors) {
      if (controls['email'].errors['required']) errors['email'] = 'Email is required';
      if (controls['email'].errors['email']) errors['email'] = 'Invalid email format';
      if (controls['email'].errors['maxlength']) errors['email'] = 'Email cannot exceed 150 characters';
    }
    if (controls['phone'].touched && controls['phone'].errors) {
      if (controls['phone'].errors['maxlength']) errors['phone'] = 'Phone number cannot exceed 20 characters';
    }
    if (controls['resume_url'].touched && controls['resume_url'].errors) {
      if (controls['resume_url'].errors['maxlength']) errors['resume_url'] = 'Resume URL cannot exceed 255 characters';
    }
    if (controls['cover_letter'].touched && controls['cover_letter'].errors) {
      if (controls['cover_letter'].errors['maxlength']) errors['cover_letter'] = 'Cover letter cannot exceed 5000 characters';
    }

    return errors;
  }

  onSubmit() {
    if (this.applicationForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const application: Partial<ApplicationModel> = {
      job_id: this.data.job.id!,
      name: this.applicationForm.get('name')!.value,
      email: this.applicationForm.get('email')!.value,
      phone: this.applicationForm.get('phone')!.value || undefined,
      resume_url: this.applicationForm.get('resume_url')!.value || undefined,
      cover_letter: this.applicationForm.get('cover_letter')!.value || undefined,
      status: 'Pending'
    };

    this.jobService.submitApplication(application).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Application submitted successfully! You will receive a confirmation email shortly.';
        this.applicationForm.reset();
        setTimeout(() => this.dialogRef.close(true), 2000); // Close dialog after 2 seconds
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Failed to submit application. Please try again.';
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
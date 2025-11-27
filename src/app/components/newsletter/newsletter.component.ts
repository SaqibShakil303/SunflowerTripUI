import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter/newsletter.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss']
})
export class NewsletterComponent {
  newsletterForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
emailSubscribe: string = '';
  constructor(
    private fb: FormBuilder,
    private newsletterService: NewsletterService
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['']
    });
  }

  onSubmit() {
    if (this.newsletterForm.invalid || this.isSubmitting) return;

    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    const { email, name } = this.newsletterForm.value;

    this.newsletterService.subscribe(email, name).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = 'Thank you for subscribing! 🎉';
        this.newsletterForm.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message || 'Something went wrong. Please try again.';
        console.error('Newsletter subscribe failed:', err);
      }
    });
  }

  
  subscribeNewsletter(): void {
    if (this.validateEmail(this.emailSubscribe)) {
      console.log('Subscribing email:', this.emailSubscribe);
      this.emailSubscribe = '';
      alert('Thank you for subscribing to our newsletter!');
    } else {
      alert('Please enter a valid email address.');
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }
}

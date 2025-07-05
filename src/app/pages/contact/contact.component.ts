import { Component, AfterViewInit, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';
import { HeaderComponent } from "../../common/header/header.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { ContactService } from '../../services/contact/contact.service';
import { ContactModel } from '../../models/contact.model';
import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  //  providers: [
  //       HttpClientModule,   
  //   // provideHttpClient(),   // ← makes HttpClient injectable in this subtree
  // ],
  imports: [CommonModule, ReactiveFormsModule, FooterComponent, NavbarComponent, ChatWidgetComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInStagger', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ContactComponent implements OnInit {

  contactForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Custom validation messages
  validationMessages = {
    name: {
      required: 'Name is required',
      minlength: 'Name must be at least 2 characters long',
      pattern: 'Name must contain only letters'
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address'
    },
    phone: {
      pattern: 'Please enter a valid phone number',
      minlength: 'Phone number must be at least 10 digits',
      maxlength: 'Phone number cannot exceed 15 digits'
    },
    subject: {
      required: 'Subject is required',
      minlength: 'Subject must be at least 5 characters long'
    },
    message: {
      required: 'Message is required',
      minlength: 'Message must be at least 10 characters long'
    }
  };
  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService,
  ) {}
  ngOnInit(): void {
    this.initializeForm();
  }


  private initializeForm(): void {
   this.contactForm = this.formBuilder.group({
      name: ['', [ Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z ]*$') ]],
      email: ['', [ Validators.required, Validators.email ]],
      phone: ['', [ Validators.pattern('^[0-9]*$'), Validators.minLength(9), Validators.maxLength(15) ]],
      subject: ['', [ Validators.required, Validators.minLength(5) ]],
      message: ['', [/*, Validators.minLength(10)*/ ]],
    });
  }

  // Helper methods to check field validity
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.isSubmitted));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control && control.errors) {
      const errors = Object.keys(control.errors);
      if (errors.length > 0) {
        const firstError = errors[0];
        // Type assertion to fix the error
        return (this.validationMessages as { [key: string]: { [key: string]: string } })[fieldName][firstError];
      }
    }
    return '';
  }

  // Form submission
  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Check if form is valid
    if (this.contactForm.valid) {
      this.isLoading = true;
      const contact_ID = this.contactService.generateRandomContactID();
      
      // Create contact model
      const formData = new ContactModel();
      formData.id = contact_ID;
      formData.firstName = this.contactForm.value.name.trim();
      formData.phoneNumber = this.contactForm.value.phone?.trim();
      formData.email = this.contactForm.value.email.trim().toLowerCase();
      formData.description = this.contactForm.value.subject.trim();
      formData.message = this.contactForm.value.message.trim();

      // Submit only if required fields are present after trimming
      if (this.validateFormData(formData)) {
        this.submitForm(formData);
      } else {
        this.errorMessage = 'Please fill in all required fields correctly.';
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Please correct the errors in the form.';
      this.markFormGroupTouched(this.contactForm);
    }
  }

  private validateFormData(formData: ContactModel): boolean {
    return !!(
      formData.firstName &&
      formData.email &&
      formData.description &&
      formData.message &&
      formData.firstName.length >= 2 &&
      formData.message.length >= 10
    );
  }

  private submitForm(formData: ContactModel): void {
    this.contactService.submitContactDetail(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Your message has been sent successfully!';
        this.contactForm.reset();
        this.isSubmitted = false;
        console.log('Form submission successful:', response);
      },
      error: (error) => {
        this.errorMessage = 'Failed to send your message. Please try again later.';
        console.error('Error in form submission:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Utility method to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Reset form
  resetForm(): void {
    this.contactForm.reset();
    this.isSubmitted = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleFaq(faq: any): void {
    // Close all other FAQs
    this.faqs.forEach(item => {
      if (item !== faq) {
        item.isOpen = false;
      }
    });
    faq.isOpen = !faq.isOpen;
  }
  faqs = [
    {
      question: 'Can I customize my travel package?',
      answer: 'Yes, all our packages are fully customizable based on your preferences. Our travel experts will work with you to create a personalized itinerary that suits your interests, budget, and time constraints.',
      isOpen: false
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We offer flexible cancellation depending on the package and timeframe. Generally, cancellations made 30 days before departure receive a full refund, while cancellations between 15-29 days receive a 50% refund. Please check your specific package details for exact terms.',
      isOpen: false
    },
    {
      question: 'Do you arrange visa assistance?',
      answer: 'Yes, we provide comprehensive visa assistance including documentation guidance, application form filling, and appointment scheduling for most destinations. Our team keeps updated with the latest visa requirements to ensure a smooth process.',
      isOpen: false
    },
    {
      question: 'Is travel insurance included in your packages?',
      answer: 'Basic travel insurance is included in all our international packages. However, we recommend upgrading to our premium insurance options for extended coverage including higher medical benefits, trip cancellation protection, and coverage for adventure activities.',
      isOpen: false
    },
    {
      question: 'How many people are typically in a group tour?',
      answer: 'Our standard group tours typically have 8-16 participants to ensure personal attention and comfort. For specialized tours and expeditions, group sizes may vary. Private tours are also available for those seeking a more exclusive experience.',
      isOpen: false
    }
  ];
}
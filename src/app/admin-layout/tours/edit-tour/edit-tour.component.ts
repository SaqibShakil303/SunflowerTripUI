import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

interface Tour {
  id: number;
  destinationId: number;
  destinationName: string;
  title: string;
  slug: string;
  description: string;
  itinerary: string;
  duration: number;
  price: number;
  image: string | File | null;
  category: string;
  from: string;
  to: string;
  departureAirport: string;
  arrivalAirport: string;
  maxGroupSize: number;
  minGroupSize: number;
  inclusions: string[];
  exclusions: string[];
  complimentaries: string[];
  highlights: string[];
  bookingTerms: string;
  cancellationPolicy: string;
  metaTitle: string;
  metaDescription: string;
  pricePerPerson: number;
  currency: string;
  earlyBirdDiscount: number;
  groupDiscount: number;
  difficultyLevel: string;
  physicalRequirements: string;
  bestTimeToVisit: string;
  weatherInfo: string;
  packingList: string[];
  languagesSupported: string[];
  guidesIncluded: boolean;
  transportationIncluded: boolean;
  transportationDetails: string;
  mealsIncluded: string[];
  dietaryRestrictionsSupported: boolean;
  accommodationType: string;
  accommodationRating: string;
  activityTypes: string[];
  interests: string[];
  instantBooking: boolean;
  requiresApproval: boolean;
  advanceBookingDays: number;
  isActive: boolean;
  isFeatured: boolean;
  adults: boolean;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfRooms: number;
  isCustomizable: boolean;
}

interface Destination {
  id: number;
  name: string;
}

@Component({
  selector: 'app-edit-tour',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule],
  templateUrl: './edit-tour.component.html',
  styleUrls: ['./edit-tour.component.scss']
})
export class EditTourComponent implements OnInit {
  tourForm: FormGroup;
  inclusionInput: string = '';
  highlightInput: string = '';
  isSubmitting: boolean = false;
  imagePreview: string | null = null;

  categories = [
    'Cultural',
    'City Tour',
    'Beach & Culture',
    'Historical',
    'Adventure',
    'Wellness'
  ];

  destinations: Destination[] = [
    { id: 1, name: 'Paris' },
    { id: 3, name: 'New York City' },
    { id: 4, name: 'Bali' },
    { id: 5, name: 'London' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTourComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: Tour
  ) {
    this.tourForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null, [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      destinationName: ['', [Validators.required]],
      category: ['', [Validators.required]],
      duration: [1, [Validators.required, Validators.min(1), Validators.max(30)]],
      pricePerPerson: [0, [Validators.required, Validators.min(0)]],
      currency: ['USD', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      image: [null], // Optional for editing
      from: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      to: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      departureAirport: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      arrivalAirport: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      inclusions: [[], [Validators.required, Validators.minLength(1)]],
      highlights: [[], [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      itinerary: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      maxGroupSize: [1, [Validators.required, Validators.min(1)]],
      minGroupSize: [1, [Validators.required, Validators.min(1)]],
      instantBooking: [false],
      requiresApproval: [false],
      isActive: [true],
      isFeatured: [false]
    });
  }

  private populateForm(): void {
    const {
      id,
      title,
      destinationName,
      category,
      duration,
      pricePerPerson,
      currency,
      image,
      from,
      to,
      departureAirport,
      arrivalAirport,
      inclusions,
      highlights,
      description,
      itinerary,
      maxGroupSize,
      minGroupSize,
      instantBooking,
      requiresApproval,
      isActive,
      isFeatured
    } = this.data;

    this.tourForm.patchValue({
      id,
      title,
      destinationName,
      category,
      duration,
      pricePerPerson,
      currency,
      from,
      to,
      departureAirport,
      arrivalAirport,
      inclusions: [...(inclusions || [])],
      highlights: [...(highlights || [])],
      description,
      itinerary,
      maxGroupSize,
      minGroupSize,
      instantBooking,
      requiresApproval,
      isActive,
      isFeatured
    });

    // Handle existing image
    if (typeof image === 'string' && image) {
      this.imagePreview = image;
      this.tourForm.get('image')?.setValue(null); // No new file selected
      this.cdr.detectChanges();
    } else if (image instanceof File) {
      this.tourForm.get('image')?.setValue(image);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        this.imagePreview = null;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(image);
    } else {
      this.imagePreview = null;
      this.cdr.detectChanges();
    }
  }

  // Image handling
  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const imageControl = this.tourForm.get('image');

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (!validTypes.includes(file.type)) {
        imageControl?.setErrors({ invalidType: true });
        this.imagePreview = null;
        this.cdr.detectChanges();
        return;
      }

      imageControl?.setErrors(null);
      imageControl?.setValue(file);
      imageControl?.markAsDirty();
      imageControl?.markAsTouched();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        imageControl?.setErrors({ readError: true });
        this.imagePreview = null;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      imageControl?.setValue(null);
      this.imagePreview = typeof this.data.image === 'string' ? this.data.image : null;
      this.cdr.detectChanges();
    }
  }

  // Inclusions management
  addInclusion(): void {
    if (this.inclusionInput.trim()) {
      const currentInclusions = this.tourForm.get('inclusions')?.value || [];
      const newInclusion = this.inclusionInput.trim();

      if (!currentInclusions.includes(newInclusion)) {
        const updatedInclusions = [...currentInclusions, newInclusion];
        this.tourForm.patchValue({ inclusions: updatedInclusions });
      }

      this.inclusionInput = '';
    }
  }

  removeInclusion(inclusion: string): void {
    const currentInclusions = this.tourForm.get('inclusions')?.value || [];
    const updatedInclusions = currentInclusions.filter((inc: string) => inc !== inclusion);
    this.tourForm.patchValue({ inclusions: updatedInclusions });
  }

  onInclusionKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addInclusion();
    }
  }

  // Highlights management
  addHighlight(): void {
    if (this.highlightInput.trim()) {
      const currentHighlights = this.tourForm.get('highlights')?.value || [];
      const newHighlight = this.highlightInput.trim();

      if (!currentHighlights.includes(newHighlight)) {
        const updatedHighlights = [...currentHighlights, newHighlight];
        this.tourForm.patchValue({ highlights: updatedHighlights });
      }

      this.highlightInput = '';
    }
  }

  removeHighlight(highlight: string): void {
    const currentHighlights = this.tourForm.get('highlights')?.value || [];
    const updatedHighlights = currentHighlights.filter((hl: string) => hl !== highlight);
    this.tourForm.patchValue({ highlights: updatedHighlights });
  }

  onHighlightKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addHighlight();
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.tourForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.tourForm.get(fieldName);

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
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['invalidType']) {
        return 'Please select a valid image (PNG, JPG, or JPEG)';
      }
      if (field.errors['readError']) {
        return 'Error reading the image file';
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Tour title',
      destinationName: 'Destination',
      category: 'Category',
      duration: 'Duration',
      pricePerPerson: 'Price per person',
      currency: 'Currency',
      image: 'Image',
      from: 'From',
      to: 'To',
      departureAirport: 'Departure airport',
      arrivalAirport: 'Arrival airport',
      inclusions: 'Inclusions',
      highlights: 'Highlights',
      description: 'Description',
      itinerary: 'Itinerary',
      maxGroupSize: 'Max group size',
      minGroupSize: 'Min group size'
    };
    return labels[fieldName] || fieldName;
  }

  // Form submission
  onSubmit(): void {
    if (this.tourForm.valid) {
      this.isSubmitting = true;

      // Simulate API call
      setTimeout(() => {
        const formValue = this.tourForm.value;
        const updatedTour: Tour = {
          ...this.data, // Preserve fields not in form
          id: formValue.id,
          destinationId: this.destinations.find(d => d.name === formValue.destinationName)?.id || this.data.destinationId,
          destinationName: formValue.destinationName,
          title: formValue.title,
          slug: formValue.title.toLowerCase().replace(/\s+/g, '-'),
          description: formValue.description,
          itinerary: formValue.itinerary,
          duration: formValue.duration,
          price: formValue.pricePerPerson,
          image: formValue.image || this.data.image, // Keep existing image if no new file
          category: formValue.category,
          from: formValue.from,
          to: formValue.to,
          departureAirport: formValue.departureAirport,
          arrivalAirport: formValue.arrivalAirport,
          maxGroupSize: formValue.maxGroupSize,
          minGroupSize: formValue.minGroupSize,
          inclusions: formValue.inclusions,
          highlights: formValue.highlights,
          pricePerPerson: formValue.pricePerPerson,
          currency: formValue.currency,
          instantBooking: formValue.instantBooking,
          requiresApproval: formValue.requiresApproval,
          isActive: formValue.isActive,
          isFeatured: formValue.isFeatured
        };

        this.dialogRef.close(updatedTour);
        this.isSubmitting = false;
      }, 1000);
    } else {
      Object.keys(this.tourForm.controls).forEach(key => {
        this.tourForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
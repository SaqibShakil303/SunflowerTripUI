import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { Destination } from '../../../models/destination.model';
import { DestinationService } from '../../../services/destination/destination.service';
import { TourService } from '../../../services/tours/tour.service';

@Component({
  selector: 'app-add-tour',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatSnackBarModule, HttpClientModule],
  templateUrl: './add-tour.component.html',
  styleUrls: ['./add-tour.component.scss']
})
export class AddTourComponent implements OnInit {
  tourForm!: FormGroup;
  imagePreviews: { [key: string]: string } = {};
  isSubmitting = false;
  destinations: Destination[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTourComponent>,
    private tourService: TourService,
    private destinationService: DestinationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

 ngOnInit(): void {
  this.tourForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+')]],
    destination_id: [null, Validators.required],
    location_ids: [''], // Store as comma-separated string
    location: [''],
    duration_days: [1, [Validators.required, Validators.min(1), Validators.max(30)]],
    category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    price_per_person: [0, [Validators.required, Validators.min(0)]],
    price_currency: ['INR', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    image_url: [''],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    departure_airport: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    arrival_airport: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    available_from: ['', Validators.required],
    available_to: ['', Validators.required],
    max_group_size: [null],
    min_group_size: [null],
    inclusions: [''],
    exclusions: [''],
    complementaries: [''],
    highlights: [''],
    booking_terms: [''],
    cancellation_policy: [''],
    meta_title: [''],
    meta_description: [''],
    early_bird_discount: [null],
    group_discount: [null],
    difficulty_level: ['Moderate'],
    physical_requirements: [''],
    best_time_to_visit: [''],
    weather_info: [''],
    packing_list: [''],
    languages_supported: [''],
    guide_included: [true],
    guide_languages: [''],
    transportation_included: [true],
    transportation_details: [''],
    meals_included: [''],
    dietary_restrictions_supported: [''],
    accommodation_type: [''],
    accommodation_rating: [null],
    activity_types: [''],
    interests: [''],
    instant_booking: [false],
    requires_approval: [true],
    advance_booking_days: [null],
    is_active: [true],
    is_featured: [true],
    is_customizable: [true],
    photos: this.fb.array([]),
    itinerary: this.fb.array([], Validators.required),
    room_types: this.fb.array([]),
    reviews: this.fb.array([])
  });

  this.loadDestinations();
}

  get photos() { return this.tourForm.get('photos') as FormArray<FormGroup>; }
  get itineraryDays() { return this.tourForm.get('itinerary') as FormArray<FormGroup>; }
  get roomTypes() { return this.tourForm.get('room_types') as FormArray<FormGroup>; }
  get reviews() { return this.tourForm.get('reviews') as FormArray<FormGroup>; }

  loadDestinations(): void {
    this.destinationService.getDestinationNames().subscribe({
      next: (destinations) => {
        this.destinations = destinations.filter(dest => dest.parent_id !== null);
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load destinations', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  addPhoto(): void {
    this.photos.push(this.fb.group({
      url: ['', Validators.required],
      caption: ['', Validators.maxLength(100)],
      is_primary: [false],
      display_order: [null]
    }));
  }

  addItineraryDay(): void {
    this.itineraryDays.push(this.fb.group({
      day: [this.itineraryDays.length + 1, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      activities: [''],
      meals_included: [''],
      accommodation: ['']
    }));
  }

  addRoomType(): void {
    this.roomTypes.push(this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      max_occupancy: [1, [Validators.required, Validators.min(1)]],
      description: ['', Validators.maxLength(500)]
    }));
  }

  addReview(): void {
    this.reviews.push(this.fb.group({
      reviewer_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      rating: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      date: ['', Validators.required],
      is_verified: [true],
      is_approved: [true]
    }));
  }

  removeItem(array: FormArray<FormGroup>, index: number, arrayName: string): void {
    array.removeAt(index);
    delete this.imagePreviews[`${arrayName}-${index}`];
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.tourForm.valid) {
      this.isSubmitting = true;
      const formValue = this.tourForm.value;
      const payload = {
        tour: {
          title: formValue.title,
          slug: formValue.slug,
          destination_id: formValue.destination_id,
          location_ids: formValue.location_ids ? formValue.location_ids.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id)) : [],
        location: formValue.location || undefined,
          description: formValue.description,
          price: formValue.price_per_person.toFixed(2),
          price_per_person: formValue.price_per_person.toFixed(2),
          price_currency: formValue.price_currency,
          image_url: formValue.image_url,
          duration_days: formValue.duration_days,
          available_from: formValue.available_from,
          available_to: formValue.available_to,
          category: formValue.category,
          departure_airport: formValue.departure_airport,
          arrival_airport: formValue.arrival_airport,
          max_group_size: formValue.max_group_size,
          min_group_size: formValue.min_group_size,
          inclusions: formValue.inclusions ? formValue.inclusions.split('\n').filter((item: string) => item.trim()) : [],
          exclusions: formValue.exclusions ? formValue.exclusions.split('\n').filter((item: string) => item.trim()) : [],
          complementaries: formValue.complementaries ? formValue.complementaries.split('\n').filter((item: string) => item.trim()) : [],
          highlights: formValue.highlights ? formValue.highlights.split('\n').filter((item: string) => item.trim()) : [],
          booking_terms: formValue.booking_terms,
          cancellation_policy: formValue.cancellation_policy,
          meta_title: formValue.meta_title,
          meta_description: formValue.meta_description,
          early_bird_discount: formValue.early_bird_discount ? formValue.early_bird_discount.toFixed(2) : null,
          group_discount: formValue.group_discount ? formValue.group_discount.toFixed(2) : null,
          difficulty_level: formValue.difficulty_level,
          physical_requirements: formValue.physical_requirements,
          best_time_to_visit: formValue.best_time_to_visit,
          weather_info: formValue.weather_info,
          packing_list: formValue.packing_list ? formValue.packing_list.split('\n').filter((item: string) => item.trim()) : [],
          languages_supported: formValue.languages_supported ? formValue.languages_supported.split('\n').filter((item: string) => item.trim()) : [],
          guide_included: formValue.guide_included,
          guide_languages: formValue.guide_languages ? formValue.guide_languages.split('\n').filter((item: string) => item.trim()) : [],
          transportation_included: formValue.transportation_included,
          transportation_details: formValue.transportation_details,
          meals_included: formValue.meals_included ? formValue.meals_included.split('\n').filter((item: string) => item.trim()) : [],
          dietary_restrictions_supported: formValue.dietary_restrictions_supported ? formValue.dietary_restrictions_supported.split('\n').filter((item: string) => item.trim()) : [],
          accommodation_type: formValue.accommodation_type,
          accommodation_rating: formValue.accommodation_rating,
          activity_types: formValue.activity_types ? formValue.activity_types.split('\n').filter((item: string) => item.trim()) : [],
          interests: formValue.interests ? formValue.interests.split('\n').filter((item: string) => item.trim()) : [],
          instant_booking: formValue.instant_booking,
          requires_approval: formValue.requires_approval,
          advance_booking_days: formValue.advance_booking_days,
          is_active: formValue.is_active,
          is_featured: formValue.is_featured,
          is_customizable: formValue.is_customizable,
          adults: 0,
          children: 0,
          rooms: 1
        },
        photos: formValue.photos.map((photo: any) => ({
          url: photo.url,
          caption: photo.caption,
          is_primary: photo.is_primary,
          display_order: photo.display_order
        })),
        reviews: formValue.reviews.map((review: any) => ({
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          is_verified: review.is_verified,
          is_approved: review.is_approved
        })),
        room_types: formValue.room_types.map((room: any) => ({
          name: room.name,
          description: room.description,
          max_occupancy: room.max_occupancy
        })),
        itinerary: formValue.itinerary.map((day: any) => ({
          day: day.day,
          title: day.title,
          description: day.description,
          activities: day.activities ? day.activities.split('\n').filter((item: string) => item.trim()) : [],
          meals_included: day.meals_included ? day.meals_included.split('\n').filter((item: string) => item.trim()) : [],
          accommodation: day.accommodation || null
        }))
      };

      this.tourService.addTour(payload).subscribe({
        next: (result) => {
          this.snackBar.open('Tour added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(result);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.snackBar.open('Failed to add tour: ' + (err.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      Object.keys(this.tourForm.controls).forEach(key => {
        const control = this.tourForm.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach((c: any) => {
            Object.keys(c.controls).forEach(subKey => {
              c.get(subKey)?.markAsTouched();
            });
          });
        } else {
          control?.markAsTouched();
        }
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

  isFieldInvalid(control: FormGroup | FormArray, fieldName: string): boolean {
    const field = control.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(control: FormGroup | FormArray, fieldName: string): string {
    const field = control.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} must contain only lowercase letters, numbers, and hyphens`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Tour title',
      slug: 'Slug',
      destination_id: 'Destination',
      location_ids: 'Location IDs',
    location: 'Location',
      duration_days: 'Duration',
      category: 'Category',
      price_per_person: 'Price per person',
      price_currency: 'Currency',
      departure_airport: 'Departure airport',
      arrival_airport: 'Arrival airport',
      available_from: 'Available from',
      available_to: 'Available to',
      description: 'Description',
      url: 'Image URL',
      caption: 'Caption',
      day: 'Day number',
      name: 'Room name',
      max_occupancy: 'Max occupancy',
      reviewer_name: 'Reviewer name',
      rating: 'Rating',
      comment: 'Comment',
      date: 'Date'
    };
    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
}
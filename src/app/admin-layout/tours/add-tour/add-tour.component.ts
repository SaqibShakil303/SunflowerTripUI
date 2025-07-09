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
      destination_id: [null, Validators.required],
      duration_days: [1, [Validators.required, Validators.min(1), Validators.max(30)]],
      category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      price_per_person: [0, [Validators.required, Validators.min(0)]],
      price_currency: ['USD', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      from: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      to: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      available_from: ['', Validators.required],
      available_to: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      photos: this.fb.array([], Validators.required),
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

  onImageChange(event: Event, control: FormGroup, previewKey: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        control.get('url')?.setErrors({ invalidType: true });
        this.imagePreviews[previewKey] = '';
        this.cdr.detectChanges();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        control.patchValue({ url: base64String });
        this.imagePreviews[previewKey] = base64String;
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        control.get('url')?.setErrors({ readError: true });
        this.imagePreviews[previewKey] = '';
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      control.patchValue({ url: '' });
      this.imagePreviews[previewKey] = '';
      this.cdr.detectChanges();
    }
  }

  addPhoto(): void {
    this.photos.push(this.fb.group({
      url: ['', Validators.required],
      caption: ['', Validators.maxLength(100)]
    }));
  }

  addItineraryDay(): void {
    this.itineraryDays.push(this.fb.group({
      day: [this.itineraryDays.length + 1, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
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
      date: ['', Validators.required]
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
          destination_id: formValue.destination_id,
          location_ids: formValue.location_ids,
          slug: formValue.slug,
          location: formValue.location,
          description: formValue.description,
          price_per_person: formValue.price_per_person,
          price_currency: formValue.price_currency,
          duration_days: formValue.duration_days,
          available_from: formValue.available_from,
          available_to: formValue.available_to,
          category: formValue.category,
          departure_airport: formValue.departure_airport,
          arrival_airport: formValue.arrival_airport,
          max_group_size: formValue.max_group_size,
          min_group_size: formValue.min_group_size,
          inclusions: formValue.inclusions,
          exclusions: formValue.exclusions,
          complementaries: formValue.complementaries,
          highlights: formValue.highlights,
          booking_terms: formValue.booking_terms,
          cancellation_policy: formValue.cancellation_policy,
          meta_title: formValue.meta_title,
          meta_description: formValue.meta_description,
          early_bird_discount: formValue.early_bird_discount,
          group_discount: formValue.group_discount,
          difficulty_level: formValue.difficulty_level,
          physical_requirements: formValue.physical_requirements,
          best_time_to_visit: formValue.best_time_to_visit,
          weather_info: formValue.weather_info,
          packing_list: formValue.packing_list,
          languages_supported: formValue.languages_supported,
          guide_included: formValue.guide_included,
          guide_languages: formValue.guide_languages,
          transportation_included: formValue.transportation_included,
          transportation_details: formValue.transportation_details,
          meals_included: formValue.meals_included,
          dietary_restrictions_supported: formValue.dietary_restrictions_supported,
          accommodation_type: formValue.accommodation_type,
          accommodation_rating: formValue.accommodation_rating,
          activity_types: formValue.activity_types,
          interests: formValue.interests,
          instant_booking: formValue.instant_booking,
          requires_approval: formValue.requires_approval,
          advance_booking_days: formValue.advance_booking_days,
          is_active: formValue.is_active,
          is_featured: formValue.is_featured,
          is_customizable: formValue.is_customizable
        },
        photos: formValue.photos.map((photo: any) => ({
          url: photo.url ? (photo.url as File).name : null,
          caption: photo.caption,
          is_primary: photo.is_primary
        })),
        reviews: formValue.reviews.map((review: any) => ({
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          comment: review.comment,
          date: review.date
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
          activities: day.activities,
          meals_included: day.meals_included,
          accommodation: day.accommodation
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
      if (field.errors['invalidType']) return 'Please select a valid image (PNG, JPG, JPEG, or WebP)';
      if (field.errors['readError']) return 'Error reading the image file';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Tour title',
      destination_id: 'Destination',
      duration_days: 'Duration',
      category: 'Category',
      price_per_person: 'Price per person',
      price_currency: 'Currency',
      from: 'From',
      to: 'To',
      available_from: 'Available from',
      available_to: 'Available to',
      description: 'Description',
      url: 'Image',
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
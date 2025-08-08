import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { Destination } from '../../../models/destination.model';
import { DestinationNav, DestinationService } from '../../../services/destination/destination.service';
import { TourService } from '../../../services/tours/tour.service';
import { Subscription } from 'rxjs';
import { StatePersistenceService } from '../../../services/state-persistence/state-persistence.service';

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
  destinations: DestinationNav[] = [];
  categories: string[] = [];
  availableLocations: { id: number; name: string }[] = [];
  private formSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTourComponent>,
    private tourService: TourService,
    private destinationService: DestinationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private stateService: StatePersistenceService
  ) { }

  ngOnInit(): void {
    this.tourForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+')]],
      destination_ids: [[], [Validators.required, Validators.minLength(1)]], // Changed to array for multi-select
      location_ids: [[]],
      duration_days: [1, [Validators.required, Validators.min(1), Validators.max(30)]],
      category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      price_per_person: [0, [Validators.required, Validators.min(0)]],
      price_currency: ['INR', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      image_url: [''],
      map_embed_url: [''],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      departure_airport: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      arrival_airport: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      available_from: ['', Validators.required],
      available_to: ['', Validators.required],
      departures: this.fb.array([]),
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

    const savedTourState = this.stateService.tour;
    if (savedTourState && Object.keys(savedTourState).length > 0) {
      this.restoreFormState(savedTourState);
    }
    this.loadDestinations();
    this.loadCategories();

    // Listen for destination_ids changes to update available locations
    this.tourForm.get('destination_ids')?.valueChanges.subscribe(destinationIds => {
      this.updateAvailableLocations(destinationIds);
    });
  }

  get departures(): FormArray<FormGroup> {
    return this.tourForm.get('departures') as FormArray<FormGroup>;
  }

  addDeparture(): void {
    const departure = this.fb.group({
      departure_date: ['', Validators.required],
      available_seats: [0, [Validators.required, Validators.min(1)]],
    });
    this.departures.push(departure);
  }

  removeDeparture(index: number): void {
    this.departures.removeAt(index);
  }

  private restoreFormState(savedState: any): void {
    if (savedState.departures && savedState.departures.length > 0) {
      savedState.departures.forEach(() => this.addDeparture());
      this.departures.patchValue(savedState.departures);
    }
    this.tourForm.patchValue({
      title: savedState.title || '',
      slug: savedState.slug || '',
      destination_ids: savedState.destination_ids || [], // Updated for multi-select
      location_ids: savedState.location_ids || [],
      duration_days: savedState.duration_days || 1,
      category: savedState.category || '',
      price_per_person: savedState.price_per_person || 0,
      price_currency: savedState.price_currency || 'INR',
      image_url: savedState.image_url || '',
      map_embed_url: savedState.map_embed_url || '',
      description: savedState.description || '',
      departure_airport: savedState.departure_airport || '',
      arrival_airport: savedState.arrival_airport || '',
      available_from: savedState.available_from || '',
      available_to: savedState.available_to || '',
      max_group_size: savedState.max_group_size || null,
      min_group_size: savedState.min_group_size || null,
      inclusions: savedState.inclusions || '',
      exclusions: savedState.exclusions || '',
      complementaries: savedState.complementaries || '',
      highlights: savedState.highlights || '',
      booking_terms: savedState.booking_terms || '',
      cancellation_policy: savedState.cancellation_policy || '',
      meta_title: savedState.meta_title || '',
      meta_description: savedState.meta_description || '',
      early_bird_discount: savedState.early_bird_discount || null,
      group_discount: savedState.group_discount || null,
      difficulty_level: savedState.difficulty_level || 'Moderate',
      physical_requirements: savedState.physical_requirements || '',
      best_time_to_visit: savedState.best_time_to_visit || '',
      weather_info: savedState.weather_info || '',
      packing_list: savedState.packing_list || '',
      languages_supported: savedState.languages_supported || '',
      guide_included: savedState.guide_included ?? true,
      guide_languages: savedState.guide_languages || '',
      transportation_included: savedState.transportation_included ?? true,
      transportation_details: savedState.transportation_details || '',
      meals_included: savedState.meals_included || '',
      dietary_restrictions_supported: savedState.dietary_restrictions_supported || '',
      accommodation_type: savedState.accommodation_type || '',
      accommodation_rating: savedState.accommodation_rating || null,
      activity_types: savedState.activity_types || '',
      interests: savedState.interests || '',
      instant_booking: savedState.instant_booking ?? false,
      requires_approval: savedState.requires_approval ?? true,
      advance_booking_days: savedState.advance_booking_days || null,
      is_active: savedState.is_active ?? true,
      is_featured: savedState.is_featured ?? true,
      is_customizable: savedState.is_customizable ?? true
    });

    this.restoreFormArray(savedState.photos, this.photos, this.addPhoto.bind(this));
    this.restoreFormArray(savedState.itinerary, this.itineraryDays, this.addItineraryDay.bind(this));
    this.restoreFormArray(savedState.room_types, this.roomTypes, this.addRoomType.bind(this));
    this.restoreFormArray(savedState.reviews, this.reviews, this.addReview.bind(this));
  }

  private restoreFormArray(savedArray: any[], formArray: FormArray, addFn: () => void): void {
    if (savedArray && savedArray.length > 0) {
      formArray.clear();
      savedArray.forEach(() => addFn());
      formArray.patchValue(savedArray);
    }
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  get photos() { return this.tourForm.get('photos') as FormArray<FormGroup>; }
  get itineraryDays() { return this.tourForm.get('itinerary') as FormArray<FormGroup>; }
  get roomTypes() { return this.tourForm.get('room_types') as FormArray<FormGroup>; }
  get reviews() { return this.tourForm.get('reviews') as FormArray<FormGroup>; }

  loadCategories(): void {
    this.tourService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed loading categories', err)
    });
  }

  loadDestinations(): void {
    this.destinationService.getNamesAndLocations().subscribe({
      next: (destinations) => {
        this.destinations = destinations;
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

  updateAvailableLocations(destinationIds: number[]): void {
    if (destinationIds && destinationIds.length > 0) {
      // Aggregate locations from all selected destinations
      const allLocations = this.destinations
        .filter(dest => destinationIds.includes(dest.id))
        .flatMap(dest => dest.locations || []);
      // Remove duplicates by id (if any)
      this.availableLocations = Array.from(
        new Map(allLocations.map(loc => [loc.id, loc])).values()
      );
      // Reset location_ids if current selections are not in the new available locations
      const currentLocationIds = this.tourForm.get('location_ids')?.value || [];
      const validLocationIds = currentLocationIds.filter((id: number) =>
        this.availableLocations.some(loc => loc.id === id)
      );
      this.tourForm.get('location_ids')?.setValue(validLocationIds);
    } else {
      this.availableLocations = [];
      this.tourForm.get('location_ids')?.setValue([]);
    }
    this.cdr.detectChanges();
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
        title: formValue.title,
        slug: formValue.slug,
        destination_ids: formValue.destination_ids || [], // Updated for multi-select
        location_ids: formValue.location_ids || [],
        description: formValue.description,
        price: formValue.price_per_person.toFixed(2),
        price_per_person: formValue.price_per_person.toFixed(2),
        price_currency: formValue.price_currency,
        image_url: formValue.image_url,
        map_embed_url: formValue.map_embed_url,
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
        rooms: 1,
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
        })),
          departures: formValue.departures.map((departure: any) => ({
          departure_date: departure.departure_date,
          available_seats: departure.available_seats
        }))
      };

      this.tourService.addTour(payload).subscribe({
        next: (result) => {
          this.snackBar.open('Tour added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.stateService.clearTour();
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
    this.stateService.setTour(this.tourForm.value);
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
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must have at least ${field.errors['minlength'].requiredLength} selection(s)`;
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
      destination_ids: 'Destinations', // Updated for multi-select
      location_ids: 'Locations',
      duration_days: 'Duration',
      category: 'Category',
      price_per_person: 'Price per person',
      price: 'Price',
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

  clearForm(): void {
    this.stateService.clearTour();
    this.tourForm.reset({
      duration_days: 1,
      price_per_person: 0,
      price_currency: 'INR',
      guide_included: true,
      transportation_included: true,
      instant_booking: false,
      requires_approval: true,
      is_active: true,
      is_featured: true,
      is_customizable: true,
      difficulty_level: 'Moderate'
    });
    this.photos.clear();
    this.itineraryDays.clear();
    this.roomTypes.clear();
    this.reviews.clear();
    this.imagePreviews = {};
    this.cdr.detectChanges();
  }
}
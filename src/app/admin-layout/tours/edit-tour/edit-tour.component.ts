import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { TourService } from '../../../services/tours/tour.service';
import { DestinationNav, DestinationService } from '../../../services/destination/destination.service';
import { tap } from 'rxjs';

interface TourPayload {
  tour: {
    id: number;
    title: string;
    destination_ids: number[];
    location_ids: number[];
    slug: string;
    description: string;
    price: string;
    price_per_person: string;
    price_currency: string;
    image_url: string;
    map_embed_url: string;
    duration_days: number;
    available_from: string;
    available_to: string;
    category: string;
    departure_airport?: string;
    arrival_airport?: string;
    max_group_size?: number;
    min_group_size?: number;
    inclusions?: string[];
    exclusions?: string[];
    complementaries?: string[];
    highlights?: string[];
    booking_terms?: string;
    cancellation_policy?: string;
    meta_title?: string;
    meta_description?: string;
    early_bird_discount?: string;
    group_discount?: string;
    difficulty_level?: string;
    physical_requirements?: string;
    best_time_to_visit?: string;
    weather_info?: string;
    packing_list?: string[];
    languages_supported?: string[];
    guide_included?: boolean;
    guide_languages?: string[];
    transportation_included?: boolean;
    transportation_details?: string;
    meals_included?: string[];
    dietary_restrictions_supported?: string[];
    accommodation_type?: string;
    accommodation_rating?: number;
    activity_types?: string[];
    interests?: string[];
    instant_booking?: boolean;
    requires_approval?: boolean;
    advance_booking_days?: number;
    is_active?: boolean;
    is_featured?: boolean;
    is_customizable?: boolean;
    adults?: number;
    children?: number;
    rooms?: number;
  };
  photos: {
    url: string;
    caption: string;
    is_primary: boolean;
    display_order?: number;
  }[];
  reviews: {
    reviewer_name: string;
    rating: number;
    comment: string;
    date: string;
    is_verified?: boolean;
    is_approved?: boolean;
  }[];
  room_types: {
    name: string;
    description?: string;
    max_occupancy: number;
  }[];
  itinerary: {
    day_number: number;
    title: string;
    description: string;
    activities?: string[];
    meals_included?: string[];
    accommodation?: string | null;
  }[];
  departures: {
    departure_date: string;
    available_seats: number;
  }[];
}

@Component({
  selector: 'app-edit-tour',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatSnackBarModule, HttpClientModule],
  templateUrl: './edit-tour.component.html',
  styleUrls: ['./edit-tour.component.scss']
})
export class EditTourComponent implements OnInit {
  tourForm!: FormGroup;
  imagePreviews: { [key: string]: string } = {};
  isSubmitting = false;
  destinations: DestinationNav[] = [];
  categories: string[] = [];
  availableLocations: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTourComponent>,
    private tourService: TourService,
    private destinationService: DestinationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: TourPayload
  ) {
    this.tourForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDestinations().subscribe({
      next: () => {
        console.log('Destinations loaded:', this.destinations);
        console.log('Tour destination_ids:', this.data.tour.destination_ids);
        this.loadCategories().subscribe({
          next: () => {
            this.populateForm();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed loading categories', err);
            this.snackBar.open('Failed to load categories', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.populateForm();
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.snackBar.open('Failed to load destinations', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.populateForm();
        this.cdr.detectChanges();
      }
    });

    this.tourForm.get('destination_ids')?.valueChanges.subscribe((value) => {
      console.log('destination_ids changed:', value);
      this.updateAvailableLocations();
      this.cdr.detectChanges();
    });

    this.tourForm.get('category')?.valueChanges.subscribe(category => {
      this.updateValidatorsBasedOnCategory(category);
      this.cdr.detectChanges();
    });
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+')]],
      destination_ids: [[], Validators.required],
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
      reviews: this.fb.array([]),
      departures: this.fb.array([], this.groupTourValidator)
    });

    return form;
  }

  private groupTourValidator(control: import('@angular/forms').AbstractControl): { [key: string]: any } | null {
    const category = (control.parent as FormGroup)?.get('category')?.value;
    if (category === 'group' && (control instanceof FormArray) && control.length === 0) {
      return { required: true };
    }
    return null;
  }

  private updateValidatorsBasedOnCategory(category: string): void {
    const availableFrom = this.tourForm.get('available_from');
    const availableTo = this.tourForm.get('available_to');
    const departures = this.tourForm.get('departures') as FormArray;

    if (category === 'group') {
      availableFrom?.clearValidators();
      availableTo?.clearValidators();
      departures.setValidators(this.groupTourValidator);
    } else {
      availableFrom?.setValidators(Validators.required);
      availableTo?.setValidators(Validators.required);
      departures.clearValidators();
      departures.clear();
    }

    availableFrom?.updateValueAndValidity();
    availableTo?.updateValueAndValidity();
    departures.updateValueAndValidity();
  }

  private populateForm(): void {
    const tour = this.data.tour;
    const validDestinationIds = Array.isArray(tour.destination_ids)
      ? tour.destination_ids.filter(id => id != null && this.destinations.some(dest => dest.id === id))
      : [];

    console.log('Valid destination_ids to set:', validDestinationIds);

    this.tourForm.patchValue({
      title: tour.title || '',
      slug: tour.slug || '',
      location_ids: tour.location_ids || [],
      duration_days: tour.duration_days || 1,
      category: tour.category || '',
      price_per_person: tour.price_per_person ? parseFloat(tour.price_per_person) : 0,
      price_currency: tour.price_currency || 'INR',
      image_url: tour.image_url || '',
      map_embed_url: tour.map_embed_url || '',
      description: tour.description || '',
      departure_airport: tour.departure_airport || '',
      arrival_airport: tour.arrival_airport || '',
      available_from: tour.available_from ? tour.available_from.split('T')[0] : '',
      available_to: tour.available_to ? tour.available_to.split('T')[0] : '',
      max_group_size: tour.max_group_size || null,
      min_group_size: tour.min_group_size || null,
      inclusions: tour.inclusions?.join('\n') || '',
      exclusions: tour.exclusions?.join('\n') || '',
      complementaries: tour.complementaries?.join('\n') || '',
      highlights: tour.highlights?.join('\n') || '',
      booking_terms: tour.booking_terms || '',
      cancellation_policy: tour.cancellation_policy || '',
      meta_title: tour.meta_title || '',
      meta_description: tour.meta_description || '',
      early_bird_discount: tour.early_bird_discount ? parseFloat(tour.early_bird_discount) : null,
      group_discount: tour.group_discount ? parseFloat(tour.group_discount) : null,
      difficulty_level: tour.difficulty_level || 'Moderate',
      physical_requirements: tour.physical_requirements || '',
      best_time_to_visit: tour.best_time_to_visit || '',
      weather_info: tour.weather_info || '',
      packing_list: tour.packing_list?.join('\n') || '',
      languages_supported: tour.languages_supported?.join('\n') || '',
      guide_included: tour.guide_included ?? true,
      guide_languages: tour.guide_languages?.join('\n') || '',
      transportation_included: tour.transportation_included ?? true,
      transportation_details: tour.transportation_details || '',
      meals_included: tour.meals_included?.join('\n') || '',
      dietary_restrictions_supported: tour.dietary_restrictions_supported?.join('\n') || '',
      accommodation_type: tour.accommodation_type || '',
      accommodation_rating: tour.accommodation_rating || null,
      activity_types: tour.activity_types?.join('\n') || '',
      interests: tour.interests?.join('\n') || '',
      instant_booking: tour.instant_booking ?? false,
      requires_approval: tour.requires_approval ?? true,
      advance_booking_days: tour.advance_booking_days || null,
      is_active: tour.is_active ?? true,
      is_featured: tour.is_featured ?? true,
      is_customizable: tour.is_customizable ?? true
    });

    this.tourForm.get('destination_ids')?.setValue(validDestinationIds, { emitEvent: true });
    this.cdr.detectChanges();

    this.populatePhotos();
    this.populateItinerary();
    this.populateRoomTypes();
    this.populateReviews();
    this.populateDepartures();

    this.updateAvailableLocations();
    this.updateValidatorsBasedOnCategory(tour.category || '');
  }

  private populatePhotos(): void {
    const photosArray = this.photos;
    photosArray.clear();
    (this.data.photos || []).forEach(photo => {
      photosArray.push(this.fb.group({
        url: [photo.url || '', Validators.required],
        caption: [photo.caption || '', Validators.maxLength(100)],
        is_primary: [photo.is_primary || false],
        display_order: [photo.display_order || null]
      }));
    });
  }

  private populateItinerary(): void {
    const itineraryArray = this.itineraryDays;
    itineraryArray.clear();
    (this.data.itinerary || []).forEach(item => {
      itineraryArray.push(this.fb.group({
        day_number: [item.day_number || 1, [Validators.required, Validators.min(1)]],
        title: [item.title || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        description: [item.description || '', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
        activities: [item.activities?.join('\n') || ''],
        meals_included: [item.meals_included?.join('\n') || ''],
        accommodation: [item.accommodation || '']
      }));
    });
  }

  private populateRoomTypes(): void {
    const roomTypesArray = this.roomTypes;
    roomTypesArray.clear();
    (this.data.room_types || []).forEach(room => {
      roomTypesArray.push(this.fb.group({
        name: [room.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        description: [room.description || '', Validators.maxLength(500)],
        max_occupancy: [room.max_occupancy || 1, [Validators.required, Validators.min(1)]]
      }));
    });
  }

  private populateReviews(): void {
    const reviewsArray = this.reviews;
    reviewsArray.clear();
    (this.data.reviews || []).forEach(review => {
      reviewsArray.push(this.fb.group({
        reviewer_name: [review.reviewer_name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        rating: [review.rating || 1, [Validators.required, Validators.min(1), Validators.max(5)]],
        comment: [review.comment || '', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
        date: [review.date ? review.date.split('T')[0] : '', Validators.required],
        is_verified: [review.is_verified ?? true],
        is_approved: [review.is_approved ?? true]
      }));
    });
  }

  private populateDepartures(): void {
    const departuresArray = this.departures;
    departuresArray.clear();
    (this.data.departures || []).forEach(departure => {
      departuresArray.push(this.fb.group({
        departure_date: [departure.departure_date ? departure.departure_date.split('T')[0] : '', Validators.required],
        available_seats: [departure.available_seats || 1, [Validators.required, Validators.min(1)]]
      }));
    });
  }

  get photos() { return this.tourForm.get('photos') as FormArray<FormGroup>; }
  get itineraryDays() { return this.tourForm.get('itinerary') as FormArray<FormGroup>; }
  get roomTypes() { return this.tourForm.get('room_types') as FormArray<FormGroup>; }
  get reviews() { return this.tourForm.get('reviews') as FormArray<FormGroup>; }
  get departures() { return this.tourForm.get('departures') as FormArray<FormGroup>; }

  loadDestinations() {
    return this.destinationService.getNamesAndLocations().pipe(
      tap((destinations: DestinationNav[]) => {
        this.destinations = destinations;
      })
    );
  }

  loadCategories() {
    return this.tourService.getCategories().pipe(
      tap((categories: string[]) => {
        this.categories = categories;
      })
    );
  }

  updateAvailableLocations(): void {
    const selectedDestinationIds = this.tourForm.get('destination_ids')?.value || [];
    console.log('Updating available locations for destination_ids:', selectedDestinationIds);
    if (selectedDestinationIds.length) {
      this.availableLocations = this.destinations
        .filter(dest => selectedDestinationIds.includes(dest.id))
        .flatMap(dest => dest.locations || [])
        .filter(loc => loc.id != null && loc.name != null);
      const currentLocationIds = this.tourForm.get('location_ids')?.value || [];
      const validLocationIds = currentLocationIds.filter((id: number) =>
        this.availableLocations.some(loc => loc.id === id)
      );
      this.tourForm.get('location_ids')?.setValue(validLocationIds, { emitEvent: false });
    } else {
      this.availableLocations = [];
      this.tourForm.get('location_ids')?.setValue([], { emitEvent: false });
    }
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
      day_number: [this.itineraryDays.length + 1, [Validators.required, Validators.min(1)]],
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

  addDeparture(): void {
    this.departures.push(this.fb.group({
      departure_date: ['', Validators.required],
      available_seats: [1, [Validators.required, Validators.min(1)]]
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

      // Validate destination_ids before submission
      const destinationIds = formValue.destination_ids || [];
      if (!destinationIds.every((id: number) => this.destinations.some(dest => dest.id === id))) {
        this.isSubmitting = false;
        this.snackBar.open('Selected destinations are invalid', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
        return;
      }

      const tourData = {
        id: this.data.tour.id,
        title: formValue.title,
        slug: formValue.slug,
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
        early_bird_discount: formValue.early_bird_discount ? formValue.early_bird_discount.toString() : null,
        group_discount: formValue.group_discount ? formValue.group_discount.toString() : null,
        difficulty_level: formValue.difficulty_level,
        physical_requirements: formValue.physical_requirements,
        best_time_to_visit: formValue.best_time_to_visit,
        weather_info: formValue.weather_info,
        packing_list: formValue.packing_list ? formValue.packing_list.split('\n').filter((item: string) => item.trim()) : [],
        languages_supported: formValue.languages_supported ? formValue.languages_supported.split('\n').filter((item: string) => item.trim()) : [],
        guide_included: formValue.guide_included ? true : false,
        guide_languages: formValue.guide_languages ? formValue.guide_languages.split('\n').filter((item: string) => item.trim()) : [],
        transportation_included: formValue.transportation_included ? true : false,
        transportation_details: formValue.transportation_details,
        meals_included: formValue.meals_included ? formValue.meals_included.split('\n').filter((item: string) => item.trim()) : [],
        dietary_restrictions_supported: formValue.dietary_restrictions_supported ? formValue.dietary_restrictions_supported.split('\n').filter((item: string) => item.trim()) : [],
        accommodation_type: formValue.accommodation_type,
        accommodation_rating: formValue.accommodation_rating,
        activity_types: formValue.activity_types ? formValue.activity_types.split('\n').filter((item: string) => item.trim()) : [],
        interests: formValue.interests ? formValue.interests.split('\n').filter((item: string) => item.trim()) : [],
        instant_booking: formValue.instant_booking ? true : false,
        requires_approval: formValue.requires_approval ? true : false,
        advance_booking_days: formValue.advance_booking_days,
        is_active: formValue.is_active ? true : false,
        is_featured: formValue.is_featured ? true : false,
        is_customizable: formValue.is_customizable ? true : false,
        adults: 0,
        children: 0,
        rooms: formValue.rooms || 0
      };

      const payload = {
        tour: tourData,
        destination_ids: formValue.destination_ids || [],
        location_ids: formValue.location_ids || [],
        photos: formValue.photos.map((photo: any) => ({
          url: photo.url,
          caption: photo.caption,
          is_primary: photo.is_primary ? true : false,
          display_order: photo.display_order
        })),
        reviews: formValue.reviews.map((review: any) => ({
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          is_verified: review.is_verified ? true : false,
          is_approved: review.is_approved ? true : false
        })),
        room_types: formValue.room_types.map((room: any) => ({
          name: room.name,
          description: room.description,
          max_occupancy: room.max_occupancy
        })),
        itinerary: formValue.itinerary.map((day: any) => ({
          day_number: day.day_number,
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

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      this.tourService.updateTour(this.data.tour.id, payload).subscribe({
        next: (result) => {
          this.snackBar.open('Tour updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(result);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Tour update error:', err);
          const errorMessage = err.error?.message || err.message || 'Unknown server error';
          this.snackBar.open(`Failed to update tour: ${errorMessage}`, 'Close', {
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
      destination_ids: 'Destinations',
      location_ids: 'Locations',
      duration_days: 'Duration',
      category: 'Category',
      price_per_person: 'Price per person',
      price_currency: 'Currency',
      image_url: 'Image URL',
      map_embed_url: 'Map URL',
      description: 'Description',
      departure_airport: 'Departure airport',
      arrival_airport: 'Arrival airport',
      available_from: 'Available from',
      available_to: 'Available to',
      max_group_size: 'Max group size',
      min_group_size: 'Min group size',
      inclusions: 'Inclusions',
      exclusions: 'Exclusions',
      complementaries: 'Complementaries',
      highlights: 'Highlights',
      booking_terms: 'Booking terms',
      cancellation_policy: 'Cancellation policy',
      meta_title: 'Meta title',
      meta_description: 'Meta description',
      early_bird_discount: 'Early bird discount',
      group_discount: 'Group discount',
      difficulty_level: 'Difficulty level',
      physical_requirements: 'Physical requirements',
      best_time_to_visit: 'Best time to visit',
      weather_info: 'Weather info',
      packing_list: 'Packing list',
      languages_supported: 'Languages supported',
      guide_languages: 'Guide languages',
      transportation_details: 'Transportation details',
      meals_included: 'Meals included',
      dietary_restrictions_supported: 'Dietary restrictions supported',
      accommodation_type: 'Accommodation type',
      accommodation_rating: 'Accommodation rating',
      activity_types: 'Activity types',
      interests: 'Interests',
      advance_booking_days: 'Advance booking days',
      url: 'Image URL',
      caption: 'Caption',
      day_number: 'Day number',
      name: 'Room name',
      max_occupancy: 'Max occupancy',
      reviewer_name: 'Reviewer name',
      rating: 'Rating',
      comment: 'Comment',
      date: 'Date',
      departure_date: 'Departure date',
      available_seats: 'Available seats',
      departures: 'Departures'
    };
    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
}
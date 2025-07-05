import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TripPlannerService } from '../../services/TripPlanner/trip-planner.service';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trip-planner.component.html',
  styleUrl: './trip-planner.component.scss'
})
export class TripPlannerComponent implements OnInit {
  private fb = inject(FormBuilder);
  // private http = inject(HttpClient);
  public dialogRef = inject(MatDialogRef);
private plannerService = inject(TripPlannerService);
  step = 0;
  isSubmitting = false;
  estimate: string | null = null;

  tripForm: FormGroup = this.fb.group({
    // Personal Information
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9]{10,15}$/)]],
    preferred_country: [''],
    preferred_city: [''],
    departure_airport: [''],
    
    // Travel Details
    departure_date: ['', Validators.required],
    return_date: [''],
    number_of_days: [3, [Validators.required, Validators.min(1)]],
    number_of_adults: [2, [Validators.required, Validators.min(1)]],
    number_of_children: [0, [Validators.min(0)]],
    number_of_male: [0, [Validators.min(0)]],
    number_of_female: [0, [Validators.min(0)]],
    number_of_other: [0, [Validators.min(0)]],
    aged_persons: [[]],
    
    // Preferences
    hotel_rating: ['3'],
    meal_plan: ['EP'],
    room_type: ['Double'],
    need_flight: [false],
    trip_type: [''],
    estimate_range: ['']
  });
  ngOnInit() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    this.tripForm.get('departure_date')?.setValue(today);
    
    // Auto-calculate return date when departure date or days change
    this.tripForm.get('departure_date')?.valueChanges.subscribe(() => {
      this.updateReturnDate();
    });
    
    this.tripForm.get('number_of_days')?.valueChanges.subscribe(() => {
      this.updateReturnDate();
    });
  }

  private updateReturnDate() {
    const departureDate = this.tripForm.get('departure_date')?.value;
    const numberOfDays = this.tripForm.get('number_of_days')?.value;
    
    if (departureDate && numberOfDays) {
      const departure = new Date(departureDate);
      const returnDate = new Date(departure);
      returnDate.setDate(departure.getDate() + numberOfDays);
      
      this.tripForm.get('return_date')?.setValue(
        returnDate.toISOString().split('T')[0]
      );
    }
  }

  nextStep() {
    if (this.step < 3) {
      // Validate current step before proceeding
      if (this.validateCurrentStep()) {
        this.step++;
      }
    }
  }

  prevStep() {
    if (this.step > 0) {
      this.step--;
    }
  }

  private validateCurrentStep(): boolean {
    let fieldsToValidate: string[] = [];
    
    switch (this.step) {
      case 0: // Personal Information
        fieldsToValidate = ['full_name', 'email', 'phone_number'];
        break;
      case 1: // Travel Details
        fieldsToValidate = ['departure_date', 'number_of_days', 'number_of_adults'];
        break;
      case 2: // Preferences
        // All fields in this step are optional or have defaults
        return true;
      default:
        return true;
    }

    // Check if required fields are valid
    const invalidFields = fieldsToValidate.filter(field => {
      const control = this.tripForm.get(field);
      return control && control.invalid;
    });

    if (invalidFields.length > 0) {
      // Mark invalid fields as touched to show validation errors
      invalidFields.forEach(field => {
        this.tripForm.get(field)?.markAsTouched();
      });
      return false;
    }

    return true;
  }

  calculateEstimate() {
    const formData = this.tripForm.value;
    
    // Base price per person per day based on hotel rating
    let basePrice = 0;
    switch (formData.hotel_rating) {
      case '5':
        basePrice = 12000;
        break;
      case '4':
        basePrice = 9000;
        break;
      case '3':
      default:
        basePrice = 7000;
        break;
    }

    // Meal plan additional cost
    const mealCost = formData.meal_plan === 'CP' ? 1500 : 0;

    // Total travelers (children count as 0.7 of adult cost)
    const totalPax = formData.number_of_adults + (formData.number_of_children * 0.7);

    // Room type multiplier
    const roomMultiplier = this.getRoomMultiplier(formData.room_type);

    // Calculate accommodation cost
    const accommodationCost = (basePrice + mealCost) * formData.number_of_days * totalPax * roomMultiplier;

    // Flight cost (estimated)
    const flightCost = formData.need_flight ? (25000 * formData.number_of_adults + 18000 * formData.number_of_children) : 0;

    // Total cost
    const totalCost = accommodationCost + flightCost;

    // Add variance range (±15%)
    const lowEstimate = Math.floor(totalCost * 0.85);
    const highEstimate = Math.ceil(totalCost * 1.15);

    this.estimate = `₹${lowEstimate.toLocaleString('en-IN')} - ₹${highEstimate.toLocaleString('en-IN')}`;
    this.tripForm.patchValue({ estimate_range: this.estimate });
  }

  private getRoomMultiplier(roomType: string): number {
    switch (roomType) {
      case 'Suite':
        return 2.5;
      case 'Triple':
        return 1.3;
      case 'Double':
        return 1.0;
      case 'Single':
        return 0.8;
      default:
        return 1.0;
    }
  }

  submitForm() {
    if (this.tripForm.valid) {
      this.isSubmitting = true;
      
      // Ensure estimate is calculated
      if (!this.estimate) {
        this.calculateEstimate();
      }

      // Prepare form data
      const formData = {
        ...this.tripForm.value,
        submission_date: new Date().toISOString(),
        total_travelers: this.tripForm.value.number_of_adults + this.tripForm.value.number_of_children
      };

      // Submit to API
      this.plannerService.postTripPlan(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          // Show success message or handle response
          console.log('Trip request submitted successfully:', response);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error submitting trip request:', error);
          
          // Show user-friendly error message
          alert('Unable to submit your request at the moment. Please try again later or contact us directly.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.tripForm);
      alert('Please fill in all required fields correctly.');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.tripForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.tripForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return 'Please enter a valid phone number';
      if (field.errors['min']) return 'Value must be greater than 0';
      if (field.errors['minlength']) return 'Name must be at least 2 characters long';
    }
    return '';
  }
}
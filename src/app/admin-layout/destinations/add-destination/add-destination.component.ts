import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { Destination, Location, Attraction, Ethnicity, Cuisine, Activity } from '../../../models/destination.model';
import { DestinationService } from '../../../services/destination/destination.service';

@Component({
  selector: 'app-add-destination',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatSnackBarModule, HttpClientModule],
  templateUrl: './add-destination.component.html',
  styleUrls: ['./add-destination.component.scss']
})
export class AddDestinationComponent implements OnInit {
  destinationForm!: FormGroup;
  imagePreviews: { [key: string]: string } = {};
  isSubmitting = false;
  languageInput: string = '';
  continents: Destination[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDestinationComponent>,
    private destinationService: DestinationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.destinationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      parent_id: [null],
      image_url: ['', Validators.required],
      best_time_to_visit: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      weather: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      currency: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      language: ['', [Validators.required, Validators.minLength(3)]],
      time_zone: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      locations: this.fb.array([]),
      attractions: this.fb.array([]),
      ethnicities: this.fb.array([]),
      cuisines: this.fb.array([]),
      activities: this.fb.array([])
    });

    this.loadContinents();
  }

  get locations() { return this.destinationForm.get('locations') as FormArray<FormGroup>; }
  get attractions() { return this.destinationForm.get('attractions') as FormArray<FormGroup>; }
  get ethnicities() { return this.destinationForm.get('ethnicities') as FormArray<FormGroup>; }
  get cuisines() { return this.destinationForm.get('cuisines') as FormArray<FormGroup>; }
  get activities() { return this.destinationForm.get('activities') as FormArray<FormGroup>; }

  loadContinents(): void {
    this.destinationService.getDestinationNames().subscribe({
      next: (destinations) => {
        this.continents = destinations.filter(dest => dest.parent_id === null);
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load continents', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  onImageChange(event: Event, control: FormGroup = this.destinationForm, previewKey: string = 'destination'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        control.get('image_url')?.setErrors({ invalidType: true });
        this.imagePreviews[previewKey] = '';
        this.cdr.detectChanges();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        control.patchValue({ image_url: base64String });
        this.imagePreviews[previewKey] = base64String;
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        control.get('image_url')?.setErrors({ readError: true });
        this.imagePreviews[previewKey] = '';
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      control.patchValue({ image_url: '' });
      this.imagePreviews[previewKey] = '';
      this.cdr.detectChanges();
    }
  }

  addLocation() {
    this.locations.push(this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      image_url: ['', Validators.required],
      iframe_360: ['']
    }));
  }

  addAttraction() {
    this.attractions.push(this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      image_url: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      video_url: ['']
    }));
  }

  addEthnicity() {
    this.ethnicities.push(this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      image_url: ['', Validators.required]
    }));
  }

  addCuisine() {
    this.cuisines.push(this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      image_url: ['', Validators.required]
    }));
  }

  addActivity() {
    this.activities.push(this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      image_url: ['', Validators.required]
    }));
  }

  removeItem(array: FormArray<FormGroup>, index: number, arrayName: string) {
    array.removeAt(index);
    delete this.imagePreviews[`${arrayName}-${index}`];
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.destinationForm.valid) {
      this.isSubmitting = true;
      const formValue = this.destinationForm.value;
      const payload = {
        destination: {
          title: formValue.title,
          parent_id: formValue.parent_id || null,
          image_url: formValue.image_url,
          best_time_to_visit: formValue.best_time_to_visit,
          weather: formValue.weather,
          currency: formValue.currency,
          language: formValue.language,
          time_zone: formValue.time_zone,
          description: formValue.description
        },
        locations: formValue.locations.map((loc: Location) => ({
          name: loc.name,
          description: loc.description,
          image_url: loc.image_url,
          iframe_360: loc.iframe_360
        })),
        attractions: formValue.attractions.map((attr: Attraction) => ({
          title: attr.title,
          image_url: attr.image_url,
          rating: attr.rating,
          video_url: attr.video_url
        })),
        ethnicities: formValue.ethnicities.map((eth: Ethnicity) => ({
          title: eth.title,
          image_url: eth.image_url
        })),
        cuisines: formValue.cuisines.map((cui: Cuisine) => ({
          title: cui.title,
          image_url: cui.image_url
        })),
        activities: formValue.activities.map((act: Activity) => ({
          title: act.title,
          image_url: act.image_url
        })),
      };

      this.destinationService.addDestination(payload).subscribe({
        next: (result) => {
          this.snackBar.open('Destination added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(result);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.snackBar.open('Failed to add destination: ' + (err.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      Object.keys(this.destinationForm.controls).forEach(key => {
        const control = this.destinationForm.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach(c => c.markAsTouched());
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
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['max'].max}`;
      }
      if (field.errors['invalidType']) {
        return 'Please select a valid image (PNG, JPG, JPEG, or WebP)';
      }
      if (field.errors['readError']) {
        return 'Error reading the image file';
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Destination name',
      image_url: 'Image',
      best_time_to_visit: 'Best time to visit',
      weather: 'Weather',
      currency: 'Currency',
      language: 'Language',
      time_zone: 'Time zone',
      description: 'Description',
      name: 'Location name',
      rating: 'Rating'
    };
    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  addLanguage(): void {
    if (this.languageInput.trim()) {
      const currentLanguage = this.destinationForm.get('language')?.value || '';
      const newLanguage = this.languageInput.trim();
      
      if (!currentLanguage.includes(newLanguage)) {
        const updatedLanguage = currentLanguage ? `${currentLanguage}, ${newLanguage}` : newLanguage;
        this.destinationForm.patchValue({ language: updatedLanguage });
      }
      
      this.languageInput = '';
      this.cdr.detectChanges();
    }
  }

  onLanguageKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addLanguage();
    }
  }
}
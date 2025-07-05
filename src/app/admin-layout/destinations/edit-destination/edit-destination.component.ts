import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { Observable, forkJoin } from 'rxjs';
import { Destination, Location, Attraction, Ethnicity, Cuisine, Activity} from '../../../models/destination.model';
import { DestinationService } from '../../../services/destination/destination.service';
// import { Destination, Location, Attraction, Ethnicity, Cuisine, Activity } from '../models/destination.model';

@Component({
  selector: 'app-edit-destination',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule],
  templateUrl: './edit-destination.component.html',
  styleUrls: ['./edit-destination.component.scss']
})
export class EditDestinationComponent implements OnInit {
  destinationForm: FormGroup;
  languageInput: string = '';
  isSubmitting: boolean = false;
  imagePreview: string | null = null;
  parentDestinations: Destination[] = [];
  private imageFiles: { [key: string]: File } = {}; // Store File objects temporarily

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditDestinationComponent>,
    private cdr: ChangeDetectorRef,
    private destinationService: DestinationService,
    @Inject(MAT_DIALOG_DATA) public data: Destination
  ) {
    this.destinationForm = this.createForm();
  }

  ngOnInit(): void {
    this.fetchParentDestinations();
    this.populateForm();
  }

  private fetchParentDestinations(): void {
    this.destinationService.getDestinations().subscribe({
      next: (destinations) => {
        this.parentDestinations = destinations.filter(d => d.id !== this.data.id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching parent destinations:', err)
    });

   this.destinationService.getDestinationDetails(this.data.id).subscribe({
    next: (detailedDestination) => {
      console.log('Fetched destination details:', detailedDestination);
      this.data = detailedDestination;
      this.populateForm(); // Populate form with detailed data
      this.cdr.detectChanges(); // Ensure UI updates after form population
    },
    error: (err) => {
      console.error('Error fetching destination details:', err);
      this.cdr.detectChanges(); // Ensure UI updates even on error
    }
  });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null, [Validators.required]],
      parent_id: [null],
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      image_url: [null],
      best_time_to_visit: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      weather: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      currency: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      language: ['', [Validators.required, Validators.minLength(3)]],
      time_zone: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      locations: this.fb.array<FormGroup>([]),
      attractions: this.fb.array<FormGroup>([]),
      ethnicities: this.fb.array<FormGroup>([]),
      cuisines: this.fb.array<FormGroup>([]),
      activities: this.fb.array<FormGroup>([])
    });
  }

  get locations(): FormArray<FormGroup> {
    return this.destinationForm.get('locations') as FormArray<FormGroup>;
  }

  get attractions(): FormArray<FormGroup> {
    return this.destinationForm.get('attractions') as FormArray<FormGroup>;
  }

  get ethnicities(): FormArray<FormGroup> {
    return this.destinationForm.get('ethnicities') as FormArray<FormGroup>;
  }

  get cuisines(): FormArray<FormGroup> {
    return this.destinationForm.get('cuisines') as FormArray<FormGroup>;
  }

  get activities(): FormArray<FormGroup> {
    return this.destinationForm.get('activities') as FormArray<FormGroup>;
  }

  private populateForm(): void {
    const { id, parent_id, title, image_url, best_time_to_visit, weather, currency, language, time_zone, description, locations, attractions, ethnicities, cuisines, activities } = this.data;
   this.destinationForm.patchValue({
    id: id || null,
    parent_id: parent_id || null,
    title: title || '',
    image_url: image_url || null, // Use null if no image URL is provided
    best_time_to_visit: best_time_to_visit || '',
    weather: weather || '',
    currency: currency || '',
    language: language || '',
    time_zone: time_zone || '',
    description: description || ''
  });

// Populate FormArrays
  this.populateFormArray(this.locations, locations || [], this.createLocationFormGroup.bind(this));
  this.populateFormArray(this.attractions, attractions || [], this.createAttractionFormGroup.bind(this));
  this.populateFormArray(this.ethnicities, ethnicities || [], this.createEthnicityFormGroup.bind(this));
  this.populateFormArray(this.cuisines, cuisines || [], this.createCuisineFormGroup.bind(this));
  this.populateFormArray(this.activities, activities || [], this.createActivityFormGroup.bind(this));

    if (image_url) {
      this.imagePreview = image_url;
      this.destinationForm.get('image_url')?.setValue(image_url);
      this.cdr.detectChanges();
    }
     this.cdr.detectChanges();
  }

  private populateFormArray(formArray: FormArray<FormGroup>, items: any[], createFormGroup: (item: any) => FormGroup): void {
    formArray.clear();
   if (items && Array.isArray(items)) {
    items.forEach(item => {
      const formGroup = createFormGroup(item);
      formArray.push(formGroup);
    });
  }
  }

  private createLocationFormGroup(location: Location): FormGroup {
    return this.fb.group({
      id: [location.id, Validators.required],
      destination_id: [location.destination_id || this.data.id],
      name: [location.name, [Validators.required, Validators.minLength(2)]],
      description: [location.description, [Validators.required, Validators.minLength(10)]],
      image_url: [location.image_url],
      iframe_360: [location.iframe_360]
    });
  }

  private createAttractionFormGroup(attraction: Attraction): FormGroup {
    return this.fb.group({
      id: [attraction.id || 0],
    destination_id: [attraction.destination_id || this.data.id], // Ensure destination_id is set
      title: [attraction.title, [Validators.required, Validators.minLength(2)]],
      image_url: [attraction.image_url],
      rating: [attraction.rating, [Validators.required, Validators.min(0), Validators.max(5)]],
      video_url: [attraction.video_url]
    });
  }

  private createEthnicityFormGroup(ethnicity: Ethnicity): FormGroup {
    return this.fb.group({
      id: [ethnicity.id || 0],
    destination_id: [ethnicity.destination_id || this.data.id], // Ensure destination_id is set
      title: [ethnicity.title, [Validators.required, Validators.minLength(2)]],
      image_url: [ethnicity.image_url]
    });
  }

  private createCuisineFormGroup(cuisine: Cuisine): FormGroup {
    return this.fb.group({
      id: [cuisine.id || 0],
    destination_id: [cuisine.destination_id || this.data.id],
      title: [cuisine.title, [Validators.required, Validators.minLength(2)]],
      image_url: [cuisine.image_url]
    });
  }

  private createActivityFormGroup(activity: Activity): FormGroup {
    return this.fb.group({
      id: [activity.id || 0],
    destination_id: [activity.destination_id || this.data.id],
      title: [activity.title, [Validators.required, Validators.minLength(2)]],
      image_url: [activity.image_url]
    });
  }

  addLocation(): void {
    this.locations.push(this.createLocationFormGroup({ id: 0, name: '', description: '', image_url: '', iframe_360: '' }));
  }

  addAttraction(): void {
    this.attractions.push(this.createAttractionFormGroup({ title: '', image_url: '', rating: 0, video_url: '' }));
  }

  addEthnicity(): void {
    this.ethnicities.push(this.createEthnicityFormGroup({ title: '', image_url: '' }));
  }

  addCuisine(): void {
    this.cuisines.push(this.createCuisineFormGroup({ title: '', image_url: '' }));
  }

  addActivity(): void {
    this.activities.push(this.createActivityFormGroup({ title: '', image_url: '' }));
  }

  removeLocation(index: number): void {
    this.locations.removeAt(index);
    delete this.imageFiles[`locations.${index}`];
  }

  removeAttraction(index: number): void {
    this.attractions.removeAt(index);
    delete this.imageFiles[`attractions.${index}`];
  }

  removeEthnicity(index: number): void {
    this.ethnicities.removeAt(index);
    delete this.imageFiles[`ethnicities.${index}`];
  }

  removeCuisine(index: number): void {
    this.cuisines.removeAt(index);
    delete this.imageFiles[`cuisines.${index}`];
  }

  removeActivity(index: number): void {
    this.activities.removeAt(index);
    delete this.imageFiles[`activities.${index}`];
  }

onImageChange(event: Event, controlName: string, index?: number): void {
  const input = event.target as HTMLInputElement;
  const control = index !== undefined ? (this.destinationForm.get(controlName) as FormArray<FormGroup>).at(index).get('image_url') : this.destinationForm.get(controlName);
  const fileKey = index !== undefined ? `${controlName}.${index}` : controlName;

  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      control?.setErrors({ invalidType: true });
      if (controlName === 'image_url' && index === undefined) {
        this.imagePreview = null;
      }
      this.cdr.detectChanges();
      return;
    }

    this.imageFiles[fileKey] = file; // Store File object
    control?.setErrors(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (controlName === 'image_url' && index === undefined) {
        this.imagePreview = reader.result as string;
        this.destinationForm.get('image_url')?.setValue(reader.result as string); // Update form control
      }
      // Set base64 string for preview in FormArray items
      if (index !== undefined) {
        control?.setValue(reader.result as string);
      }
      this.cdr.detectChanges();
    };
    reader.onerror = () => {
      control?.setErrors({ readError: true });
      if (controlName === 'image_url' && index === undefined) {
        this.imagePreview = null;
      }
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  } else {
    control?.setValue(null);
    delete this.imageFiles[fileKey];
    if (controlName === 'image_url' && index === undefined) {
      this.imagePreview = this.data.image_url || null;
      this.destinationForm.get('image_url')?.setValue(this.data.image_url || null); // Reset form control
    }
    this.cdr.detectChanges();
  }
}

  // private uploadImage(file: File): Observable<string> {
  //   // Assuming DestinationService has an uploadImage method that returns the URL
  //   // return this.destinationService.uploadImage(file);
  // }

  isFieldInvalid(fieldName: string, index?: number): boolean {
    let field;
    if (index !== undefined && this.destinationForm.get(fieldName) instanceof FormArray) {
      field = (this.destinationForm.get(fieldName) as FormArray<FormGroup>).at(index);
    } else {
      field = this.destinationForm.get(fieldName);
    }
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, index?: number): string {
    let field;
    if (index !== undefined && this.destinationForm.get(fieldName) instanceof FormArray) {
      field = (this.destinationForm.get(fieldName) as FormArray<FormGroup>).at(index);
    } else {
      field = this.destinationForm.get(fieldName);
    }

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
      if (field.errors['invalidType']) {
        return 'Please select a valid image (PNG, JPG, JPEG, or WebP)';
      }
      if (field.errors['readError']) {
        return 'Error reading the image file';
      }
      if (field.errors['min'] || field.errors['max']) {
        return 'Rating must be between 0 and 5';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': 'Destination name',
      'parent_id': 'Parent Destination',
      'image_url': 'Image',
      'best_time_to_visit': 'Best time to visit',
      'weather': 'Weather',
      'currency': 'Currency',
      'language': 'Language',
      'time_zone': 'Time zone',
      'description': 'Description',
      'locations': 'Location',
      'attractions': 'Attraction',
      'ethnicities': 'Ethnicity',
      'cuisines': 'Cuisine',
      'activities': 'Activity'
    };
    return labels[fieldName] || fieldName;
  }

onSubmit(): void {
  if (this.destinationForm.valid) {
    this.isSubmitting = true;
    const formValue = this.destinationForm.value;
    const updatedDestination: Destination = {
      id: formValue.id,
      parent_id: formValue.parent_id || null,
      title: formValue.title,
      image_url: formValue.image_url || this.data.image_url,
      best_time_to_visit: formValue.best_time_to_visit,
      weather: formValue.weather,
      currency: formValue.currency,
      language: formValue.language,
      time_zone: formValue.time_zone,
      description: formValue.description,
      locations: formValue.locations,
      attractions: formValue.attractions,
      ethnicities: formValue.ethnicities,
      cuisines: formValue.cuisines,
      activities: formValue.activities
    };

    this.destinationService.updateDestination(formValue.id, updatedDestination).subscribe({
      next: (result) => {
        this.dialogRef.close(result);
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error updating destination:', err);
        this.isSubmitting = false;
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
  }
}

  onCancel(): void {
    this.dialogRef.close();
  }
}
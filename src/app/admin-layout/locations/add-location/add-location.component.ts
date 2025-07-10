import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Destination } from '../../../models/destination.model';
import { LocationModel } from '../../../models/location.model';
import { DestinationService } from '../../../services/destination/destination.service';
import { LocationService } from '../../../services/location/location.service';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule],
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent implements OnInit {
  locationForm: FormGroup;
  isSubmitting: boolean = false;
  imagePreview: string | null = null;
  imageInputType: 'file' | 'url' = 'file';
  destinations: Destination[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLocationComponent>,
    private locationService: LocationService,
    private destinationService: DestinationService,
    private cdr: ChangeDetectorRef
  ) {
    this.locationForm = this.createForm();
  }

  ngOnInit(): void {
    // Fetch destinations for dropdown
    this.destinationService.getDestinationNames().subscribe({
      next: (destinations) => {
        this.destinations = destinations;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching destinations:', error);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      destinationId: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      imageFile: [null],
      imageUrl: ['', [Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|webp))$/i)]],
      iframe360: ['', [Validators.required, Validators.pattern(/^https?:\/\/.*/)]]
    });
  }

  // Toggle image input type
  setImageInputType(type: 'file' | 'url'): void {
    this.imageInputType = type;
    this.imagePreview = null;
    this.locationForm.get('imageFile')?.reset();
    this.locationForm.get('imageUrl')?.reset();
    if (type === 'file') {
      this.locationForm.get('imageFile')?.setValidators([Validators.required]);
      this.locationForm.get('imageUrl')?.clearValidators();
    } else {
      this.locationForm.get('imageUrl')?.setValidators([Validators.required, Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|webp))$/i)]);
      this.locationForm.get('imageFile')?.clearValidators();
    }
    this.locationForm.get('imageFile')?.updateValueAndValidity();
    this.locationForm.get('imageUrl')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  // Handle file input
  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const imageFileControl = this.locationForm.get('imageFile');

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        imageFileControl?.setErrors({ invalidType: true });
        this.imagePreview = null;
        this.cdr.detectChanges();
        return;
      }

      imageFileControl?.setErrors(null);
      imageFileControl?.setValue(file);
      imageFileControl?.markAsDirty();
      imageFileControl?.markAsTouched();

      // Generate preview and save as base64
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        imageFileControl?.setValue(reader.result); // Save base64 string
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        imageFileControl?.setErrors({ readError: true });
        this.imagePreview = null;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      imageFileControl?.setValue(null);
      imageFileControl?.setErrors({ required: true });
      this.imagePreview = null;
      this.cdr.detectChanges();
    }
  }

  // Handle URL input
  onImageUrlChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const imageUrlControl = this.locationForm.get('imageUrl');
    const url = input.value;

    if (url && imageUrlControl?.valid) {
      this.imagePreview = url;
    } else {
      this.imagePreview = null;
    }
    this.cdr.detectChanges();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.locationForm.get(fieldName);

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
        return 'Please select a valid image (PNG, JPG, WEBP or JPEG)';
      }
      if (field.errors['readError']) {
        return 'Error reading the image file';
      }
      if (field.errors['pattern'] && fieldName === 'imageUrl') {
        return 'Please enter a valid image URL (PNG, JPG, WEBP or JPEG)';
      }
      if (field.errors['pattern'] && fieldName === 'iframe360') {
        return 'Please enter a valid URL starting with http:// or https://';
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'name': 'Location name',
      'destinationId': 'Destination',
      'description': 'Description',
      'imageFile': 'Image',
      'imageUrl': 'Image URL',
      'iframe360': '360° View URL'
    };
    return labels[fieldName] || fieldName;
  }

  // Form submission
  onSubmit(): void {
    if (this.locationForm.valid && (this.imageInputType === 'file' ? this.locationForm.get('imageFile')?.valid : this.locationForm.get('imageUrl')?.valid)) {
      this.isSubmitting = true;

      const formValue = this.locationForm.value;
      const locationData: Partial<LocationModel> = {
        destination_id: formValue.destinationId,
        name: formValue.name,
        description: formValue.description,
        iframe_360: formValue.iframe360,
        image_url: this.imageInputType === 'url' ? formValue.imageUrl : formValue.imageFile // Use base64 for file
      };

      this.locationService.addLocation(locationData).subscribe({
        next: (insertId) => {
          this.isSubmitting = false;
          this.dialogRef.close({ ...locationData, id: insertId });
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error adding location:', error);
          alert('Failed to add location. Please try again.');
          this.cdr.detectChanges();
        }
      });
    } else {
      Object.keys(this.locationForm.controls).forEach(key => {
        this.locationForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Destination } from '../../../models/destination.model';
import { LocationModel } from '../../../models/location.model';
import { DestinationService } from '../../../services/destination/destination.service';
import { LocationService } from '../../../services/location/location.service';

@Component({
  selector: 'app-edit-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule],
  templateUrl: './edit-location.component.html',
  styleUrls: ['./edit-location.component.scss']
})
export class EditLocationComponent implements OnInit {
  locationForm: FormGroup;
  isSubmitting: boolean = false;
  imagePreview: string | null = null;
  imageInputType: 'file' | 'url' = 'url'; // Default to URL since existing image is likely a URL
  destinations: Destination[] = [];
  isLoadingDestinations: boolean = true; // Loading state for destinations

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditLocationComponent>,
    private locationService: LocationService,
    private destinationService: DestinationService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: LocationModel
  ) {
    this.locationForm = this.createForm();
  }

  ngOnInit(): void {
    // Fetch destinations for dropdown
    this.isLoadingDestinations = true;
    this.destinationService.getDestinationNames().subscribe({
      next: (destinations) => {
        this.destinations = destinations;
        this.isLoadingDestinations = false;
        this.populateForm();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching destinations:', error);
        this.isLoadingDestinations = false;
        this.destinations = [];
        this.populateForm();
        this.cdr.detectChanges();
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      destinationId: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      imageFile: [null],
      imageUrl: ['', [Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|webp))$/i)]],
      iframe360: ['', [Validators.required, Validators.pattern(/^https?:\/\/.*/)]]
    });
  }

  private populateForm(): void {
    const { id, name, destination_id, description, image_url, iframe_360 } = this.data;
    this.locationForm.patchValue({
      id,
      name,
      destinationId: destination_id,
      description,
      iframe360: iframe_360
    });

    // Set image preview and input type
    if (image_url) {
      this.imagePreview = image_url; // Base64 or URL
      this.imageInputType = image_url.startsWith('data:image/') ? 'file' : 'url';
      if (this.imageInputType === 'file') {
        this.locationForm.get('imageFile')?.setValue(image_url);
        this.locationForm.get('imageUrl')?.setValue('');
      } else {
        this.locationForm.get('imageUrl')?.setValue(image_url);
        this.locationForm.get('imageFile')?.setValue(null);
      }
    } else {
      this.imagePreview = null;
      this.imageInputType = 'url';
      this.locationForm.get('imageUrl')?.setValue('');
      this.locationForm.get('imageFile')?.setValue(null);
    }
    this.setImageInputType(this.imageInputType);
    this.cdr.detectChanges();
  }

  // Toggle image input type
  setImageInputType(type: 'file' | 'url'): void {
    this.imageInputType = type;
    if (type === 'file') {
      this.locationForm.get('imageFile')?.setValidators([]);
      this.locationForm.get('imageUrl')?.clearValidators();
      this.locationForm.get('imageUrl')?.setValue(''); // Clear URL field
      // Only update imagePreview if no file is selected
      if (!this.locationForm.get('imageFile')?.value && this.data.image_url && this.data.image_url.startsWith('data:image/')) {
        this.imagePreview = this.data.image_url;
        this.locationForm.get('imageFile')?.setValue(this.data.image_url);
      } else if (!this.locationForm.get('imageFile')?.value) {
        this.imagePreview = null;
      }
    } else {
      this.locationForm.get('imageUrl')?.setValidators([Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|webp))$/i)]);
      this.locationForm.get('imageFile')?.clearValidators();
      this.locationForm.get('imageFile')?.setValue(null); // Clear file field
      // Only update imagePreview if no URL is provided
      if (!this.locationForm.get('imageUrl')?.value && this.data.image_url && !this.data.image_url.startsWith('data:image/')) {
        this.imagePreview = this.data.image_url;
        this.locationForm.get('imageUrl')?.setValue(this.data.image_url);
      }
    }
    this.locationForm.get('imageFile')?.updateValueAndValidity();
    this.locationForm.get('imageUrl')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  // Handle file input
  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const imageFileControl = this.locationForm.get('imageFile');
    const imageUrlControl = this.locationForm.get('imageUrl');

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        imageFileControl?.setErrors({ invalidType: true });
        this.imagePreview = null;
        imageUrlControl?.setValue('');
        this.cdr.detectChanges();
        return;
      }

      imageFileControl?.setErrors(null);
      imageFileControl?.markAsDirty();
      imageFileControl?.markAsTouched();
      imageUrlControl?.setValue(''); // Clear URL field when file is selected

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
        imageUrlControl?.setValue('');
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      imageFileControl?.setValue(null);
      imageUrlControl?.setValue('');
      this.imagePreview = null; // Clear preview if no file is selected
      this.cdr.detectChanges();
    }
  }

  // Handle URL input changes
  onImageUrlChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const imageUrlControl = this.locationForm.get('imageUrl');
    const value = input.value;

    if (value) {
      imageUrlControl?.setValue(value);
      imageUrlControl?.markAsDirty();
      imageUrlControl?.markAsTouched();
      this.imagePreview = value; // Update preview to new URL
      this.locationForm.get('imageFile')?.setValue(null); // Clear file field
    } else {
      imageUrlControl?.setValue('');
      this.imagePreview = this.data.image_url && !this.data.image_url.startsWith('data:image/') ? this.data.image_url : null;
    }
    imageUrlControl?.updateValueAndValidity();
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
        return 'Please select a valid image (PNG, JPG, JPEG or WEBP)';
      }
      if (field.errors['readError']) {
        return 'Error reading the image file';
      }
      if (field.errors['pattern'] && fieldName === 'imageUrl') {
        return 'Please enter a valid image URL (PNG, JPG, JPEG or WEBP)';
      }
      if (field.errors['pattern'] && fieldName === 'iframe360') {
        return 'Please enter a valid URL starting with http:// or https://';
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      id: 'ID',
      name: 'Location name',
      destinationId: 'Destination',
      description: 'Description',
      imageFile: 'Image',
      imageUrl: 'Image URL',
      iframe360: '360° View URL'
    };
    return labels[fieldName] || fieldName;
  }

  // Form submission
  onSubmit(): void {
    if (this.locationForm.valid && (this.imageInputType === 'file' ? !this.locationForm.get('imageFile')?.invalid : !this.locationForm.get('imageUrl')?.invalid)) {
      this.isSubmitting = true;

      const formValue = this.locationForm.value;
      const locationData: Partial<LocationModel> = {
        id: formValue.id,
        destination_id: formValue.destinationId,
        name: formValue.name,
        description: formValue.description,
        iframe_360: formValue.iframe360,
        image_url: this.imageInputType === 'url' ? formValue.imageUrl || this.data.image_url : formValue.imageFile || this.data.image_url
      };

      this.locationService.updateLocation(locationData).subscribe({
        next: (updatedLocation) => {
          this.isSubmitting = false;
          this.dialogRef.close(updatedLocation);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating location:', error);
          alert('Failed to update location. Please try again.');
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

  // Reset image inputs to original state
  private resetImageInputs(): void {
    if (this.data.image_url) {
      this.imagePreview = this.data.image_url;
      this.imageInputType = this.data.image_url.startsWith('data:image/') ? 'file' : 'url';
      if (this.imageInputType === 'file') {
        this.locationForm.get('imageFile')?.setValue(this.data.image_url);
        this.locationForm.get('imageUrl')?.setValue('');
      } else {
        this.locationForm.get('imageUrl')?.setValue(this.data.image_url);
        this.locationForm.get('imageFile')?.setValue(null);
      }
    } else {
      this.imagePreview = null;
      this.imageInputType = 'url';
      this.locationForm.get('imageUrl')?.setValue('');
      this.locationForm.get('imageFile')?.setValue(null);
    }
    this.setImageInputType(this.imageInputType);
    this.cdr.detectChanges();
  }
}
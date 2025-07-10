import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Destination } from '../../../models/destination.model';
import { LocationModel } from '../../../models/location.model';
import { DestinationService } from '../../../services/destination/destination.service';
import { LocationService } from '../../../services/location/location.service';
import { debounceTime } from 'rxjs/operators';

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
  isLoadingDestinations: boolean = false;
  imagePreview: string | null = null;
  imageInputType: 'file' | 'url' = 'url'; // Default to URL since existing image is likely a URL
  destinations: Destination[] = [];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

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
        this.isLoadingDestinations = false;
        console.error('Error fetching destinations:', error);
        alert('Failed to load destinations. Please try again.');
        this.cdr.detectChanges();
      }
    });

    // Debounce image URL input
    this.locationForm.get('imageUrl')?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      if (this.imageInputType === 'url' && value && this.locationForm.get('imageUrl')?.valid) {
        this.imagePreview = value;
      } else {
        this.imagePreview = this.data.image_url || null;
      }
      this.cdr.detectChanges();
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
      iframe360: iframe_360,
      imageUrl: image_url // Explicitly set imageUrl
    });

    // Set image preview and input type
    if (image_url) {
      this.imagePreview = image_url; // Base64 or URL
      this.imageInputType = image_url.startsWith('data:image/') ? 'file' : 'url';
      if (this.imageInputType === 'file') {
        this.locationForm.get('imageFile')?.setValue(image_url);
        this.locationForm.get('imageUrl')?.setValue(''); // Clear URL field for base64
      } else {
        this.locationForm.get('imageUrl')?.setValue(image_url); // Ensure URL field is populated
      }
    } else {
      this.imagePreview = null;
      this.imageInputType = 'url';
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
      this.locationForm.get('imageUrl')?.setValue(''); // Clear URL when switching to file
    } else {
      this.locationForm.get('imageUrl')?.setValidators([Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|webp))$/i)]);
      this.locationForm.get('imageFile')?.clearValidators();
      this.locationForm.get('imageFile')?.setValue(null); // Clear file when switching to URL
      if (this.data.image_url && !this.data.image_url.startsWith('data:image/')) {
        this.locationForm.get('imageUrl')?.setValue(this.data.image_url); // Preserve existing URL
        this.imagePreview = this.data.image_url;
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

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        imageFileControl?.setErrors({ invalidType: true });
        this.imagePreview = null;
        this.locationForm.get('imageUrl')?.setValue('');
        this.cdr.detectChanges();
        return;
      }

      imageFileControl?.setErrors(null);
      imageFileControl?.markAsDirty();
      imageFileControl?.markAsTouched();

      // Generate preview and save as base64
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        imageFileControl?.setValue(reader.result); // Save base64 string
        this.locationForm.get('imageUrl')?.setValue(''); // Clear URL field
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        imageFileControl?.setErrors({ readError: true });
        this.imagePreview = null;
        this.locationForm.get('imageUrl')?.setValue('');
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      imageFileControl?.setValue(null);
      this.imagePreview = this.data.image_url || null;
      this.locationForm.get('imageUrl')?.setValue(this.data.image_url || '');
      this.cdr.detectChanges();
    }
  }

  // Handle URL input
  onImageUrlChange(event: Event): void {
    // Handled by valueChanges subscription with debounce
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
      if (field.errors['fileTooLarge']) {
        return 'Image file must not exceed 5MB';
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
}
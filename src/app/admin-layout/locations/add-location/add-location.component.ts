import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Destination } from '../../../models/destination.model';
import { LocationModel } from '../../../models/location.model';
import { DestinationService } from '../../../services/destination/destination.service';
import { LocationService } from '../../../services/location/location.service';
const IMAGE_URL_REGEX =
  /^https?:\/\/[^\s]+?\.(?:png|jpe?g|webp)(?:\?[^\s#]*)?(?:#[^\s]*)?$/i;
@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent implements OnInit {
  locationForm: FormGroup;
  isSubmitting: boolean = false;
  imagePreview: string | null = null;
  imageInputType: 'file' | 'url' = 'file';
  destinations: Destination[] = [];
urlChecking = false;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLocationComponent>,
    private locationService: LocationService,
    private destinationService: DestinationService,
    private snackBar: MatSnackBar,
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
        this.snackBar.open('Failed to load destinations', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
       this.setImageInputType(this.imageInputType);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      destination_ids: [[], [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      imageFile: [null],
      imageUrl: ['', []],
      iframe360: ['', [Validators.required, Validators.pattern(/^https?:\/\/.*/)]]
    });
  }

  // Toggle image input type
  setImageInputType(type: 'file' | 'url'): void {
    this.imageInputType = type;
    this.imagePreview = null;

    const imageFileCtrl = this.locationForm.get('imageFile')!;
    const imageUrlCtrl  = this.locationForm.get('imageUrl')!;

    // reset values & errors
    imageFileCtrl.reset();
    imageUrlCtrl.reset();
    imageFileCtrl.setErrors(null);
    imageUrlCtrl.setErrors(null);

    if (type === 'file') {
      imageFileCtrl.setValidators([Validators.required]);
      imageUrlCtrl.clearValidators();
    } else {
      // required + improved regex
      imageUrlCtrl.setValidators([
        Validators.required,
        Validators.pattern(IMAGE_URL_REGEX)
      ]);
      imageFileCtrl.clearValidators();
    }

    imageFileCtrl.updateValueAndValidity();
    imageUrlCtrl.updateValueAndValidity();
    this.cdr.detectChanges();
  }
  // Small helper to verify that the image URL actually loads
  private loadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
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
 async onImageUrlChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const imageUrlCtrl = this.locationForm.get('imageUrl')!;
    const url = input.value?.trim();

    this.imagePreview = null;
    imageUrlCtrl.markAsTouched();

    // If pattern fails, show format error immediately
    if (!url || imageUrlCtrl.hasError('required') ||
        (IMAGE_URL_REGEX.test(url) === false)) {
      imageUrlCtrl.setErrors({ ...(imageUrlCtrl.errors || {}), pattern: true });
      this.cdr.detectChanges();
      return;
    }

    // Pattern OK → verify it actually loads
    this.urlChecking = true;
    this.cdr.detectChanges();

    const ok = await this.loadImage(url);
    this.urlChecking = false;

    if (ok) {
      // valid and loadable
      imageUrlCtrl.setErrors(null);
      this.imagePreview = url;
    } else {
      // unreachable or blocked
      imageUrlCtrl.setErrors({ invalidImageUrl: true });
      this.imagePreview = null;
    }
    this.cdr.detectChanges();
  }


  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }


  // Error message helper: add cases for invalidImageUrl
  getFieldError(fieldName: string): string {
    const field = this.locationForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength'] && fieldName === 'destination_ids') {
        return `${this.getFieldLabel(fieldName)} must have at least ${field.errors['minlength'].requiredLength} selection(s)`;
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
      if (field.errors['invalidImageUrl']) {
        return 'The image URL could not be loaded (unreachable or blocked).';
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
      'destination_ids': 'Destinations',
      'description': 'Description',
      'imageFile': 'Image',
      'imageUrl': 'Image URL',
      'iframe360': '360° View URL'
    };
    return labels[fieldName] || fieldName;
  }

  // Form submission
  onSubmit(): void {
    // ensure the active input is valid
    const usingFile = this.imageInputType === 'file';
    const activeCtrl = this.locationForm.get(usingFile ? 'imageFile' : 'imageUrl')!;

    if (!this.locationForm.valid || activeCtrl.invalid) {
      Object.keys(this.locationForm.controls).forEach(key => {
        this.locationForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000, panelClass: ['error-snackbar']
      });
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    const v = this.locationForm.value;

    const locationData: Partial<LocationModel> = {
      destination_ids: v.destination_ids,
      name: v.name,
      description: v.description,
      iframe_360: v.iframe360,
      image_url: usingFile ? v.imageFile : v.imageUrl   // base64 or URL
    };

    this.locationService.addLocation(locationData).subscribe({
      next: (insertId) => {
        this.snackBar.open('Location added successfully', 'Close', {
          duration: 3000, panelClass: ['success-snackbar']
        });
        this.isSubmitting = false;
        this.dialogRef.close({ ...locationData, id: insertId });
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open('Failed to add location: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000, panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

 
  onCancel(): void {
    this.dialogRef.close();
  }
}
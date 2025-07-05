import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Location {
  id: number;
  name: string;
  destinationName: string;
  description: string;
  image: File | null | string;
  iframe360: string | SafeResourceUrl;
}

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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditLocationComponent>,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: Location
  ) {
    this.locationForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      destinationName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      image: [null], // Optional for editing
      iframe360: ['', [Validators.required, Validators.pattern(/^https:\/\/www\.google\.com\/maps\/embed\?pb=.*/)]]
    });
  }

  private populateForm(): void {
    const { id, name, destinationName, description, image, iframe360 } = this.data;
    this.locationForm.patchValue({
      id,
      name,
      destinationName,
      description,
      iframe360: typeof iframe360 === 'string' ? iframe360 : this.data.iframe360 as string
    });

    // Handle existing image
    if (typeof image === 'string' && image) {
      this.imagePreview = image;
      this.locationForm.get('image')?.setValue(null); // No new file selected
      this.cdr.detectChanges();
    } else if (image instanceof File) {
      this.locationForm.get('image')?.setValue(image);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        this.imagePreview = null;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(image);
    } else {
      this.imagePreview = null;
      this.cdr.detectChanges();
    }
  }

  // Image handling
  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const imageControl = this.locationForm.get('image');

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (!validTypes.includes(file.type)) {
        imageControl?.setErrors({ invalidType: true });
        this.imagePreview = null;
        this.cdr.detectChanges();
        return;
      }

      imageControl?.setErrors(null);
      imageControl?.setValue(file);
      imageControl?.markAsDirty();
      imageControl?.markAsTouched();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        imageControl?.setErrors({ readError: true });
        this.imagePreview = null;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      imageControl?.setValue(null);
      this.imagePreview = typeof this.data.image === 'string' ? this.data.image : null;
      this.cdr.detectChanges();
    }
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
        return 'Please select a valid image (PNG, JPG, or JPEG)';
      }
      if (field.errors['readError']) {
        return 'Error reading the image file';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid Google Maps embed URL';
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'id': 'ID',
      'name': 'Location name',
      'destinationName': 'Destination',
      'description': 'Description',
      'image': 'Image',
      'iframe360': '360° View URL'
    };
    return labels[fieldName] || fieldName;
  }

  // Form submission
  onSubmit(): void {
    if (this.locationForm.valid) {
      this.isSubmitting = true;

      // Simulate API call
      setTimeout(() => {
        const formValue = this.locationForm.value;
        const updatedLocation: Location = {
          id: formValue.id,
          name: formValue.name,
          destinationName: formValue.destinationName,
          description: formValue.description,
          image: formValue.image || this.data.image, // Keep existing image if no new file
          iframe360: this.sanitizer.bypassSecurityTrustResourceUrl(formValue.iframe360)
        };

        this.dialogRef.close(updatedLocation);
        this.isSubmitting = false;
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.locationForm.controls).forEach(key => {
        this.locationForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
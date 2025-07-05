import { Component, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../../common/footer/footer.component';
import { HeaderComponent } from '../../common/header/header.component';
import { ChatWidgetComponent } from '../../components/chat-widget/chat-widget.component';
import { ItineraryService } from '../../services/itinerary/itinerary.service';
import { Itinerary } from '../../models/itinerary.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, timeout } from 'rxjs/operators';
import { NavbarComponent } from "../../common/navbar/navbar.component";

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FooterComponent,
    // HeaderComponent,
    ChatWidgetComponent,
    NavbarComponent
],
  providers: [ItineraryService], // Provide service locally
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ItineraryComponent implements OnDestroy {
  itineraryForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  private destroy$ = new Subject<void>();
isBengali = false;
  get childAges(): FormArray {
    return this.itineraryForm.get('childAges') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private itineraryService: ItineraryService,
    private cdr: ChangeDetectorRef
  ) {
    this.itineraryForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      destination: [''],
      travelers: [1],
      children: [0],
      childAges: this.fb.array([]),
      duration: [1],
      date: [''],
      budget: [''],
      hotelCategory: [''],
      travelType: [''],
      occupation: [''],
      preferences: ['']
    });

this.itineraryForm.get('children')!.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((count: number) => {
        const agesArray = this.childAges;
        const validCount = Math.max(0, +count || 0);

        while (agesArray.length > validCount) {
          agesArray.removeAt(agesArray.length - 1);
        }
        while (agesArray.length < validCount) {
          agesArray.push(this.fb.control('', [Validators.required, Validators.min(0), Validators.max(17)]));
        }
        this.cdr.markForCheck();
      });
  }
  // toggleLanguage(): void {
  //   this.isBengali = !this.isBengali;
  // }


  onSubmit() {
    this.isSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.itineraryForm.get('name')?.invalid || this.itineraryForm.get('email')?.invalid || this.itineraryForm.get('phone')?.invalid) {
      this.errorMessage = 'Please fill in Name, Email and Phone.';
      this.markFormGroupTouched(this.itineraryForm);
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    const formData = this.buildItineraryPayload();

    this.itineraryService.submitItineraryDetail(formData).pipe(
      timeout(10000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Your plan has been submitted successfully!';
        this.resetForm();
        this.isSubmitted = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = err.name === 'TimeoutError'
          ? 'Request timed out. Please try again.'
          : 'Failed to submit your plan. Please try again.';
        this.cdr.markForCheck();
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
  private buildItineraryPayload(): Itinerary {
    const v = this.itineraryForm.value;
    return {
      name: v.name,
      email: v.email.trim().toLowerCase(),
      phone: v.phone.trim(),
      destination: v.destination.trim(),
      travelers: v.travelers,
      children: v.children,
      childAges: v.childAges,
      duration: v.duration,
      date: v.date,
      budget: v.budget,
      hotelCategory: v.hotelCategory,
      travelType: v.travelType,
      occupation: v.occupation,
      preferences: v.preferences.trim()
    };
  }

  private validateFormData(f: Itinerary): boolean {
    return !!(f.name && f.email && f.phone && f.budget && f.travelType && f.date);
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private resetForm() {
    this.itineraryForm.reset({
      travelers: 1,
      children: 0,
      duration: 1,
      childAges: []
    });
    while (this.childAges.length) {
      this.childAges.removeAt(0);
    }
    this.cdr.markForCheck();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Tour } from '../../models/tour.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatePersistenceService } from '../../services/state-persistence/state-persistence.service';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.scss']
})
export class BookingModalComponent {
  @Input() isOpen: boolean = false;
  @Input() formType: 'enquiry' | 'booking' = 'enquiry';
  @Input() tour: Tour | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() onSubmitEnquiry = new EventEmitter<any>();
  @Output() onSubmitBooking = new EventEmitter<any>();

  enquiryData = {
    name: '',
    email: '',
    phone: '',
    description: ''
  };

  bookingData = {
    name: '',
    email: '',
    phone: '',
    days: this.tour?.duration_days,
    adults: 1,
    children: 0,
    childAges: [] as number[],
    hotelRating: '',
    mealPlan: '',
    flightOption: '',
    flightNumber: '' as string | undefined, // New field
    travelDate: ''
  };

  ageOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  minDate: string = '';

constructor(private stateSvc: StatePersistenceService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue && this.tour) {
      this.setMinDate();
         const savedBooking = this.stateSvc.booking;
    const savedEnquiry = this.stateSvc.enquiry;

    this.bookingData = { ...this.bookingData, ...savedBooking };
    this.enquiryData = { ...this.enquiryData, ...savedEnquiry };
    }
  }

  setMinDate() {
    const today = new Date();
    let monthsToAdd = 2; // Default to 2 months
    if (this.tour?.location) {
      // Example logic: adjust based on location
      if (['Europe', 'Asia'].includes(this.tour.location)) {
        monthsToAdd = 4;
      }
    }
    today.setMonth(today.getMonth() + monthsToAdd);
    this.minDate = today.toISOString().split('T')[0];
    this.bookingData.travelDate = this.minDate;
  }

  resetForms() {
    this.enquiryData = { name: '', email: '', phone: '', description: '' };
    this.bookingData = {
      name: '',
      email: '',
      phone: '',
      days: undefined,
      adults: 1,
      children: 0,
      childAges: [],
      hotelRating: '',
      mealPlan: '',
      flightOption: '',
      flightNumber: '', // Reset to empty string
      travelDate: this.minDate
    };
  }

  updateChildAges() {
    const childCount = this.bookingData.children || 0;
    this.bookingData.childAges = Array(childCount)
      .fill(null)
      .map((_, i) => this.bookingData.childAges[i] || 1);
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  submitEnquiry(form: NgForm) {
    if (form.valid) {
      this.stateSvc.setEnquiry(this.enquiryData);
      this.onSubmitEnquiry.emit({ ...this.enquiryData, tourId: this.tour?.id });
      this.closeModal();
    }
  }

  submitBooking(form: NgForm) {
    if (form.valid) {
         this.stateSvc.setBooking(this.bookingData);
      this.onSubmitBooking.emit({ ...this.bookingData, tourId: this.tour?.id });
      this.closeModal();
    }
  }
}
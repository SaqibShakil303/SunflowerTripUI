import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Tour } from '../../models/tour.model';
import { TourService } from '../../services/tours/tour.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../common/footer/footer.component";
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";
import { BookingModalComponent } from "../../components/booking-modal/booking-modal.component";
import { Meta, Title } from '@angular/platform-browser';
import { BookingsService } from '../../services/bookings/bookings.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FooterComponent,
    NavbarComponent,
    ChatWidgetComponent,
    BookingModalComponent,
    MatSnackBarModule
  ],
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.scss']
})
export class TourDetailComponent implements OnInit {
  tour: Tour | null = null;
  loading = true;
  activeTab = 'overview';
  inclusionTab = 'inclusions';
  selectedDate = '';
  selectedGuests = 1;
  openDayIndex: number | null = null;
  isModalOpen = false;
  modalFormType: 'enquiry' | 'booking' = 'enquiry';

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookingsService: BookingsService,
    private meta: Meta,
    private title: Title,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.loading = false;
      return;
    }

    this.tourService.getTourBySlug(slug).subscribe({
      next: (tour) => {
        this.tour = this.transformTourData(tour);
        this.selectedDate = this.formatDate(tour.available_from);
        this.loading = false;

        this.title.setTitle(tour.meta_title || tour.title);
        this.meta.updateTag({ name: 'description', content: tour.meta_description || tour.description });
        this.meta.updateTag({ name: 'og:title', content: tour.meta_title || tour.title });
        this.meta.updateTag({ name: 'og:description', content: tour.meta_description || tour.description });
        this.meta.updateTag({ name: 'og:image', content: tour.image_url });
        this.meta.updateTag({ name: 'og:url', content: `https://sunflowertrip.in/tours/${tour.slug}` });
      },
      error: () => {
        this.tour = null;
        this.loading = false;
      }
    });
  }

  toggleDay(index: number) {
    this.openDayIndex = this.openDayIndex === index ? null : index;
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDay(index);
    }
  }

  private transformTourData(data: any): Tour {
    data.inclusions = this.safeParse(data.inclusions);
    data.exclusions = this.safeParse(data.exclusions);
    data.complementaries = this.safeParse(data.complementaries);
    data.highlights = this.safeParse(data.highlights);
    data.languages_supported = this.safeParse(data.languages_supported);
    data.meals_included = this.safeParse(data.meals_included);
    data.activity_types = this.safeParse(data.activity_types);
    return data as Tour;
  }

  private safeParse(field: any): any[] {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toISOString().split('T')[0];
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-IN');
  }

  getAvailabilityText(): string {
    if (!this.tour) return '';
    const fromDate = new Date(this.tour.available_from);
    const toDate = new Date(this.tour.available_to);
    return `Available ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
  }

  getMinDate(): string {
    if (!this.tour) return '';
    return new Date(this.tour.available_from).toISOString().split('T')[0];
  }

  getMaxDate(): string {
    if (!this.tour) return ''; 
    return new Date(this.tour.available_to).toISOString().split('T')[0];
  }

  getItineraryDays(): any[] {
    if (!this.tour?.itinerary) return [];
    
    if (typeof this.tour.itinerary === 'string') {
      return this.tour.itinerary.split('\n').map((day, index) => ({
        title: `Day ${index + 1}`,
        description: day.replace(/^Day \d+:\s*/, '')
      }));
    }
    
    return this.tour.itinerary;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  openEnquiryForm(): void {
    this.modalFormType = 'enquiry';
    this.isModalOpen = true;
  }

  openBookingForm(): void {
    this.modalFormType = 'booking';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  handleEnquirySubmit(data: any): void {
    this.bookingsService.submitEnquiry(data).subscribe({
      next: (response) => {
        console.log('Enquiry submitted successfully:', response);
        if (isPlatformBrowser(this.platformId)) {
          this.snackBar.open('Your enquiry has been submitted successfully!', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Enquiry submission failed:', error.message);
        if (isPlatformBrowser(this.platformId)) {
          this.snackBar.open(`Failed to submit enquiry: ${error.message}`, 'Close', { duration: 5000 });
        }
      }
    });
  }

  handleBookingSubmit(data: any): void {
    this.bookingsService.submitBooking(data).subscribe({
      next: (response) => {
        console.log('Booking submitted successfully:', response);
        if (isPlatformBrowser(this.platformId)) {
          this.snackBar.open(`Your booking has been submitted successfully!`,'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Booking submission failed:', error.message);
        if (isPlatformBrowser(this.platformId)) {
          this.snackBar.open(`Failed to submit booking: ${error.message}`, 'Close', { duration: 5000 });
        }
      }
    });
  }

  proceedBooking(): void {
    console.log('Proceeding with booking', {
      date: this.selectedDate,
      guests: this.selectedGuests
    });
  }

  saveToWishlist(): void {
    console.log('Saving to wishlist');
  }

  viewReviews(): void {
    this.setActiveTab('reviews');
  }

  openPhotoModal(photo: any): void {
    console.log('Opening photo modal', photo);
  }
}
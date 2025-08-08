import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Tour, ItineraryDay } from '../../models/tour.model';
import { TourService } from '../../services/tours/tour.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../common/footer/footer.component";
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";
import { BookingModalComponent } from "../../components/booking-modal/booking-modal.component";
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { BookingsService } from '../../services/bookings/bookings.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DOCUMENT } from '@angular/common';
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
  selectedAdults = 0;
  selectedChildren = 0;
  selectedRooms = 1;
  openDayIndex: number | null = null;
  isModalOpen = false;
  modalFormType: 'enquiry' | 'booking' = 'enquiry';

  constructor(
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private tourService: TourService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookingsService: BookingsService,
    private meta: Meta,
    private title: Title,
    private snackBar: MatSnackBar,
      @Inject(DOCUMENT) private doc: Document    
  ) { }

  
private setCanonical(url: string) {                 // ✅ add
  let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.doc.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

private short(text?: string, n = 155): string {     // ✅ add
  if (!text) return '';
  return text.replace(/<[^>]+>/g, '').slice(0, n).trim();
}

private setJsonLd(data: object) {                   // ✅ add
  // remove any previous JSON-LD
  this.doc.querySelectorAll('script.seo-jsonld').forEach(s => s.remove());
  const s = this.doc.createElement('script');
  s.type = 'application/ld+json';
  s.classList.add('seo-jsonld');
  s.text = JSON.stringify(data);
  this.doc.head.appendChild(s);
}
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
        this.selectedAdults = tour.adults || 0;
        this.selectedChildren = tour.children || 0;
        this.selectedRooms = tour.rooms || 1;
        this.loading = false;

           const url = `https://thesunflowertrip.com/tours/${tour.slug}`;
      const title = tour.meta_title || tour.title;
      const desc  = this.short(tour.meta_description || tour.description);
      const image = tour.image_url || 'https://thesunflowertrip.com/assets/og-default.jpg';

      // ✅ Title + basic description
      this.title.setTitle(`${title} | SunflowerTrip`);
      this.meta.updateTag({ name: 'description', content: desc });

      // ✅ Open Graph
      this.meta.updateTag({ property: 'og:type', content: 'product' });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: desc });
      this.meta.updateTag({ property: 'og:image', content: image });
      this.meta.updateTag({ property: 'og:url', content: url });

      // ✅ Twitter
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: desc });
      this.meta.updateTag({ name: 'twitter:image', content: image });

      // ✅ Canonical
      this.setCanonical(url);

      // ✅ JSON-LD (Product with AggregateOffer-ish data)
      this.setJsonLd({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": title,
        "image": [image],
        "description": desc,
        "brand": { "@type": "Brand", "name": "SunflowerTrip" },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": String(tour.price || 0),
          "url": url,
          "availability": "https://schema.org/InStock"
        }
      });
        // this.title.setTitle(tour.meta_title || tour.title);
        // this.meta.updateTag({ name: 'description', content: tour.meta_description || tour.description });
        // this.meta.updateTag({ name: 'og:title', content: tour.meta_title || tour.title });
        // this.meta.updateTag({ name: 'og:description', content: tour.meta_description || tour.description });
        // this.meta.updateTag({ name: 'og:image', content: tour.image_url });
        // this.meta.updateTag({ name: 'og:url', content: `https://thesunflowertrip.com/tours/${tour.slug}` });
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
    data.interests = this.safeParse(data.interests);
    data.packing_list = this.safeParse(data.packing_list);
    data.guide_languages = this.safeParse(data.guide_languages);
    data.dietary_restrictions_supported = this.safeParse(data.dietary_restrictions_supported);
    data.departures = Array.isArray(data.departures) ? data.departures : [];
    data.guide_included = data.guide_included === 1;
    data.transportation_included = data.transportation_included === 1;
    data.instant_booking = data.instant_booking === 1;
    data.requires_approval = data.requires_approval === 1;
    data.is_active = data.is_active === 1;
    data.is_featured = data.is_featured === 1;
    data.is_customizable = data.is_customizable === 1;
    data.flight_included = data.flight_included === 1;
    data.itinerary = Array.isArray(data.itinerary) ? data.itinerary.map((day: any) => ({
      ...day,
      day: day.day_number || day.day,
      activities: this.safeParse(day.activities),
      meals_included: this.safeParse(day.meals_included)
    })) : [];
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

  formatDiscount(discount: string | number): string {
    const numDiscount = typeof discount === 'string' ? parseFloat(discount) : discount;
    return `${numDiscount}%`;
  }

  getAvailabilityText(): string {
    if (!this.tour) return '';
    if (this.tour.category === 'group' && this.tour.departures?.length) {
      const dates = this.tour.departures.map(d => new Date(d.departure_date).toLocaleDateString()).join(', ');
      return `Departures on ${dates}`;
    }
    const fromDate = new Date(this.tour.available_from);
    const toDate = new Date(this.tour.available_to);
    return `Available ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
  }

  getMinDate(): string {
    if (!this.tour) return '';
    if (this.tour.category === 'group' && this.tour.departures?.length) {
      const earliestDate = this.tour.departures.reduce((min, d) =>
        new Date(d.departure_date) < new Date(min.departure_date) ? d : min
      ).departure_date;
      return new Date(earliestDate).toISOString().split('T')[0];
    }
    return new Date(this.tour.available_from).toISOString().split('T')[0];
  }

  getMaxDate(): string {
    if (!this.tour) return '';
    if (this.tour.category === 'group' && this.tour.departures?.length) {
      const latestDate = this.tour.departures.reduce((max, d) =>
        new Date(d.departure_date) > new Date(max.departure_date) ? d : max
      ).departure_date;
      return new Date(latestDate).toISOString().split('T')[0];
    }
    return new Date(this.tour.available_to).toISOString().split('T')[0];
  }

  getItineraryDays(): ItineraryDay[] {
    if (!this.tour?.itinerary) return [];
    return Array.isArray(this.tour.itinerary) ? this.tour.itinerary : [];
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getAccommodationRatingStars(): number[] {
    if (!this.tour?.accommodation_rating) return [];
    const rating = this.tour?.accommodation_rating ?? 0;
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
    this.bookingsService.submitBooking({
      ...data,
      adults: this.selectedAdults,
      children: this.selectedChildren,
      rooms: this.selectedRooms
    }).subscribe({
      next: (response) => {
        console.log('Booking submitted successfully:', response);
        if (isPlatformBrowser(this.platformId)) {
          this.snackBar.open(`Your booking has been submitted successfully!`, 'Close', { duration: 3000 });
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
      guests: this.selectedGuests,
      adults: this.selectedAdults,
      children: this.selectedChildren,
      rooms: this.selectedRooms
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
import { Component, Input, Output, EventEmitter, SimpleChanges, PLATFORM_ID, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Tour } from '../../models/tour.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatePersistenceService } from '../../services/state-persistence/state-persistence.service';
import { CheckoutService } from '../../services/checkout/checkout.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


declare var Razorpay: any;

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
  @Input() userId?: number;    
  @Output() close = new EventEmitter<void>();
  @Output() onSubmitEnquiry = new EventEmitter<any>();
  @Output() onSubmitBooking = new EventEmitter<any>();

    loading = false;
// ----- NEW: group-mode state -----
  isGroup = false;
  selectedDepartureId: number | null = null;
  selectedDepartureSeats = 0;       // seats for selected departure BEFORE deduction
  seatsRequested = 1;               // adults + children
  seatsRemaining = 0;               // dynamic (available - requested)
  seatError = '';                   // "no available seats" message

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

  agreeTerms: boolean = false;
termsContent: string = `
TERMS & CONDITIONS


1) DEFINITIONS
- “Company”, “we”, “us”, “our”: Sunflower Trip Pvt. Ltd.
- “Client”, “you”, “your”: The person(s) booking or traveling.
- “Services”: Tours, transport, accommodation, activities, tickets and related travel services.

2) SCOPE / AGENCY
We act as a travel agent and arranger on behalf of independent suppliers (airlines, hotels, transport, attractions, visa agents, etc.). Your contracts for those services are with the respective suppliers and are subject to their terms. We select reputable providers but do not control their operations and are not liable for their acts/omissions. Any service failure, denial, or schedule change remains the supplier’s responsibility.

3) QUOTATIONS & PRICING
- Quotes are indicative until FULL payment and confirmation; they may vary due to currency fluctuation, tax/fee changes, fuel surcharges, seat/room inventory, fairs/events, or government notifications.
- Prices are per person unless stated otherwise and are valid only for the dates, hotels, flights, room categories, and inclusions mentioned in the specific itinerary/voucher.
- If a listed hotel is unavailable at ticketing/booking, a similar category will be offered. Any price difference will be notified and payable before issuance.

4) INCLUSIONS & EXCLUSIONS (SUMMARY)
Inclusions (as per your final itinerary/voucher only) may cover: flights (economy, if specified), hotel category, daily meals, specific sightseeing/admission, transfers (Pvt/SIC), tour manager where stated, applicable GST.
Common Exclusions: TCS per Indian law, travel insurance, city/resort taxes payable at hotel, language guides, laundry/room service, beverages, tips, personal expenses, camera fees, optional tours, visa rejections/appeals, anything not expressly listed as “Included”.

5) TAXES (GST/TCS) & INVOICING
- GST is charged as applicable and shown on invoice.
- TCS is collected as per prevailing Income Tax rules on overseas packages; payable with final amount.
- Government levies/taxes may change without prior notice and will be applicable at the time of final payment/issuance.

6) PAYMENTS & DUE DATES
Booking is confirmed only after receipt of the non-refundable booking amount and written confirmation from us.
- Booking Amount (non-refundable, interest-free): 
  • India: INR 4,000 per person
  • SE Asia / Middle East: INR 7,000 per person
  • Other International: INR 15,000 per person
  • Third-party packages: As per partner policy
- Processing/Interim Payments: As advised for ticketing/visas/hotels to secure inventory.
- Balance Payment: Due at least 30 days prior to departure (or earlier if required by suppliers/peak season). Bookings within 30 days require full payment upfront.
Accepted modes: UPI/Bank Transfer/Credit/Debit/EMI, Cheque (subject to clearance timelines). Tickets/vouchers are released only after funds are cleared.

7) FORFEITURE / NON-PAYMENT
If you fail to honor payment milestones, we may cancel services and forfeit paid amounts to cover supplier penalties and administrative costs, without further liability.

8) CANCELLATIONS & REFUNDS
Cancellations must be requested in writing (business days only). Charges apply from the date we receive your written request:
- ≥30 days before departure: 15% of tour/service cost
- 15–29 days: 30% of tour/service cost
- 7–14 days: 60% of tour/service cost
- <72 hours / No-show: 100% (No refund)
Peak/blackout periods (e.g., 20 Dec–10 Jan; Durga Puja; Diwali; trade fairs/events) may be strictly non-refundable as per supplier rules.
Partially used services, missed meals/sightseeing, or early check-out are non-refundable. Wildlife safaris in India are strictly non-refundable; date changes are treated as cancellations.
Refund processing (if any) may take 60 business days minimum after receiving supplier credits. International component refunds are paid in INR at the prevailing buying rate on refund date.

9) CHANGES & FORCE MAJEURE
We may alter the itinerary/hotels/transport/sightseeing due to operational or safety reasons, supplier schedule changes, weather, political conditions, strikes, technical issues, overbooking, or force majeure. Reasonable alternatives will be offered where feasible; any additional costs are payable by you. We are not liable for delays, missed connections, or consequential losses in such circumstances.

10) PASSPORTS, VISAS & TRAVEL DOCUMENTS
- Valid passport/visa(s)/permits are your responsibility. Requirements vary by destination and may change; check with consulates/official sources. We can assist on a best-effort basis only.
- Visa approval, duration, and processing time are solely at consulate discretion. Visa refusal/ delays do not entitle you to refunds beyond supplier rules; booking/visa fees remain non-refundable.
- Name on tickets must EXACTLY match the passport. Any reissue costs due to errors are borne by you.

11) HEALTH, SAFETY & INSURANCE
- You must meet all health, vaccination, and entry requirements of destinations/transit points. Obtain medical advice before travel.
- Comprehensive travel insurance (medical, baggage, trip cancellation/curtailment, COVID-related where applicable) is strongly recommended. If declined, you travel at your own risk.

12) BAGGAGE & PERSONAL EFFECTS
You are responsible for your belongings at all times. Airlines/coaches/cruises/hotels have separate rules and limits for baggage. Loss/damage/theft claims must be pursued directly with the carrier/insurer.

13) TOUR CONDUCT, PUNCTUALITY & SERVICES
Report at designated pick-ups on time; late arrival may lead to missed services without refunds. Unacceptable behavior may result in service termination with no liability on us. SIC services are shared and run on set schedules; minor waiting/route variation may occur.

14) SPECIAL EVENTS / PEAK SEASONS
Festivals, exhibitions, and major events can drive up rates and impose stricter payment/cancellation rules. Such bookings often require 100% advance and are non-refundable/non-changeable.

15) COVID-19 / PUBLIC HEALTH ADVISORIES
Entry, testing, vaccination, and quarantine rules may change with short notice. You are responsible for complying with current regulations of all transit/destination points. Non-compliance or denial of boarding/entry does not confer refund rights beyond supplier policies.

16) LIABILITY LIMITATION
To the extent permitted by law, our liability is limited to the value of services booked with us. We are not liable for indirect/consequential losses (loss of enjoyment, profits, additional expenses, etc.). We are not liable for acts of terrorism, war, civil unrest, natural disasters, epidemics, government actions, or force majeure events.

17) FOREIGN EXCHANGE / RBI COMPLIANCE
All foreign exchange utilization will follow RBI/GOI rules (including BTQ). KYC/PAN may be required for amounts above thresholds (e.g., PAN for bookings above INR 25,000). Cash limits and FX payment rules apply per RBI norms.

18) PRIVACY
We process your personal data to fulfill bookings and for lawful business purposes. See our Privacy Policy at https://thesunflowertrip.com/privacy (or updated domain) for details.

19) GOVERNING LAW & JURISDICTION
These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of competent courts at Kolkata, West Bengal.

20) CONTACT & BANK DETAILS
Sunflower Trip Pvt. Ltd.
ICICI Bank (Current A/C)
A/C No: 695005500372
IFSC: ICIC0006950
Branch: Kolkata Salt Lake Sector 1

ACKNOWLEDGEMENT
By paying the booking amount or signing/accepting these Terms (including electronically), you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions for yourself and all travelers in your booking.

`;


  ageOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  minDate: string = '';
selectedDepartureIndex: number | null = null; 
constructor(private stateSvc: StatePersistenceService,  private checkout: CheckoutService,  private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private snackBar: MatSnackBar  ) {}
  // ---------- helpers ----------
  private getDepartureById(id: number | null) {
    if (!this.tour?.departures || id == null) return undefined;
    return this.tour.departures.find(d => d.id === id);
  }

private getDepartureByIndex(idx: number | null) {
  if (!this.tour?.departures || idx == null) return undefined;
  return this.tour.departures[idx];
}


private hydrateGroupDefaults() {
  const deps = this.tour?.departures || [];
  const firstIdx = Math.max(0, deps.findIndex(d => (d.available_seats ?? 0) > 0));
  const useIdx = firstIdx === -1 ? 0 : firstIdx;

  this.selectedDepartureIndex = deps.length ? useIdx : null;
  const first = this.getDepartureByIndex(this.selectedDepartureIndex);

  this.selectedDepartureSeats = first?.available_seats ?? 0;
  this.bookingData.travelDate = first ? new Date(first.departure_date).toISOString().split('T')[0] : '';

  // Readonly labels in UI (group mode)
  this.bookingData.mealPlan = 'group-included';
  this.bookingData.hotelRating = 'group-included';
  this.bookingData.flightOption = this.tour?.flight_included ? 'with-flight' : 'without-flight';

  this.recomputeSeats();
}


  private hydrateHolidayDefaults() {
    // keep your previous behavior (calendar min date)
    this.setMinDate();
    if (!this.bookingData.travelDate) this.bookingData.travelDate = this.minDate;
  }

  private recomputeSeats() {
    // adults + children requested
    const adults = Number(this.bookingData.adults) || 0;
    const children = Number(this.bookingData.children) || 0;
    this.seatsRequested = adults + children;

    const available = this.selectedDepartureSeats || 0;
    this.seatsRemaining = Math.max(available - this.seatsRequested, 0);

    if (this.seatsRequested > available) {
      this.seatError = 'No available seats to book for this departure.';
    } else {
      this.seatError = '';
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue) {
      this.resetForms(); // clean start every time
    }
  if (changes['isOpen']?.currentValue && this.tour) {
      this.isGroup = this.tour.category === 'group';

      this.bookingData.days = this.tour.duration_days;

      // restore cached state
      const savedBooking = this.stateSvc.booking;
      if (savedBooking) {
        this.bookingData = { ...this.bookingData, ...savedBooking };
      }
      const savedEnquiry = this.stateSvc.enquiry;
      this.bookingData = { ...this.bookingData, ...savedBooking };
      this.enquiryData = { ...this.enquiryData, ...savedEnquiry };

      if (this.isGroup && this.tour.departures?.length) {
        this.hydrateGroupDefaults();
      } else {
        this.hydrateHolidayDefaults();
      }
    }
  }

  setMinDate() {
    const today = new Date();
    today.setMonth(today.getMonth() + 2);
    this.minDate = today.toISOString().split('T')[0];
    if (!this.bookingData.travelDate) this.bookingData.travelDate = this.minDate;
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
      flightNumber: '',
      travelDate: this.minDate
    };
    this.agreeTerms = false;

    // reset group state too
    this.selectedDepartureId = null;
    this.selectedDepartureSeats = 0;
    this.seatsRequested = 1;
    this.seatsRemaining = 0;
    this.seatError = '';
  }


updateChildAges() {
    const childCount = this.bookingData.children || 0;
    this.bookingData.childAges = Array(childCount).fill(null).map((_, i) => this.bookingData.childAges[i] || 1);
    if (this.isGroup) this.recomputeSeats();
  }

  onGuestsChange() {
    if (this.isGroup) this.recomputeSeats();
  }
onDepartureChange() {
  const dep = this.getDepartureByIndex(this.selectedDepartureIndex);
  this.selectedDepartureSeats = dep?.available_seats ?? 0;
  this.bookingData.travelDate = dep ? new Date(dep.departure_date).toISOString().split('T')[0] : '';
  this.recomputeSeats();
}

  
  closeModal() {
    this.stateSvc.clearBooking();
    this.resetForms()
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

  getUnitPriceInr(): number {
  if (!this.tour) return 0;
  const opt = this.bookingData.flightOption;
  if (opt === 'with-flight') return Number(this.tour.price_with_flight || 0);
  if (opt === 'without-flight') return Number(this.tour.price_per_person || 0);
  return 0;
}

getEstimatedTotalInr(): number {
  const guests = Number(this.bookingData.adults || 0) + Number(this.bookingData.children || 0);
  return this.getUnitPriceInr() * guests;
}

  async submitBooking(form: NgForm) {
     if (!isPlatformBrowser(this.platformId)) {
      return; // SSR render path — do nothing
    }
    if (!form.valid || !this.tour || !this.agreeTerms) return;
  if (this.isGroup && this.seatError) return;
    this.stateSvc.setBooking(this.bookingData);   // keep your local persistence
    this.loading = true;

// ✅ Guard: flight option must be selected
if (!this.bookingData.flightOption) {
  this.snackBar.open('Please select Flight Option (Yes/No) to continue.', 'Close', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  });
  return;
}

// ✅ Extra safety: allow only expected values
if (!['with-flight', 'without-flight'].includes(this.bookingData.flightOption)) {
  this.snackBar.open('Invalid Flight Option selected. Please choose again.', 'Close', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  });
  this.bookingData.flightOption = '';
  return;
}
    try {
      // 1) Load Razorpay checkout script
      await this.checkout.loadScript();
const guests = Number(this.bookingData.adults) + Number(this.bookingData.children || 0);

      // 2) Ask the server to create booking + order (authoritative amount)
  const selectedDep = this.getDepartureByIndex(this.selectedDepartureIndex);
    const createPayload = {
      tourId: this.tour.id,
      userId: this.userId,
      customer_name: this.bookingData.name,
      customer_email: this.bookingData.email,
      customer_phone: this.bookingData.phone,
      guests: Number(this.bookingData.adults) + Number(this.bookingData.children || 0),
      travel_date: this.bookingData.travelDate,
      departure_id: this.isGroup ? (selectedDep?.id ?? undefined) : undefined, 
      notes: {
        days: this.bookingData.days,
        hotelRating: this.bookingData.hotelRating,
        mealPlan: this.bookingData.mealPlan,
        flightOption: this.bookingData.flightOption,
        flightNumber: this.bookingData.flightNumber,
        childAges: this.bookingData.childAges
      }
,
      name: this.bookingData.name,
      email: this.bookingData.email,
      phone: this.bookingData.phone,
      adults: this.bookingData.adults,
      children: this.bookingData.children || 0,
        days: this.bookingData.days,
        hotel_rating: this.bookingData.hotelRating,
        meal_plan: this.bookingData.mealPlan,
        flight_option: this.bookingData.flightOption,
        flight_number: this.bookingData.flightNumber,
        child_ages: this.bookingData.childAges
      
    };
console.log('Creating order with payload:', createPayload);

      const order = await this.checkout.create(createPayload).toPromise();
      // order = { key, orderId, amount, currency, bookingId }

      // 3) Open Razorpay Checkout
      const rzp = new Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Sunflower Trip Pvt. Ltd.',
        description: `Tour Booking: ${this.tour.title}`,
        order_id: order.orderId,
        prefill: {
          name: this.bookingData.name,
          email: this.bookingData.email,
          contact: this.bookingData.phone
        },
        handler: async (resp: any) => {
          // 4) Verify on the server
          const verify = await this.checkout.verify({
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_signature: resp.razorpay_signature
          }).toPromise();

          if (verify?.ok) {
            //   if (this.isGroup && this.selectedDepartureId && guests > 0) {
            //   // implement this API in your CheckoutService (or BookingsService)
            //   await this.checkout.consumeSeats({
            //     tourId: this.tour!.id,
            //     departure_id: this.selectedDepartureId,
            //     seats: guests
            //   }).toPromise();
            // }

            // optional: emit to parent if you still want
            this.stateSvc.setBooking(this.bookingData);
            this.onSubmitBooking.emit({ ...this.bookingData, tourId: this.tour?.id });
            this.resetForms();
            this.closeModal();
            this.router.navigate(
              ['/booking/success', verify.bookingId],
              { queryParams: { paymentId: verify.paymentId } }
            );
          } else {
            this.closeModal();
            this.router.navigate(['/booking/cancelled'], { queryParams: { reason: 'verify-failed' }});
          }
        },
        modal: {
          ondismiss: () => {
            this.closeModal();
            this.router.navigate(['/booking/cancelled'], { queryParams: { reason: 'user-dismissed' }});
          }
        },
        theme: { color: '#4cd7d0' }
      });

      rzp.open();
    } catch (err: any) {
      console.error(err);
      this.closeModal();
      this.router.navigate(['/booking/cancelled'], { queryParams: { reason: 'start-failed' }});
    } finally {
      this.loading = false;
      // popup notification 
      this.snackBar.open('Your Booking created successfully. Please login to your account', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

}
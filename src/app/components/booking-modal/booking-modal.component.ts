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

  agreeTerms: boolean = false;

  termsContent: string = `
NOTE: 
 The above mentioned hotels will be confirmed as per the room availability. 
Otherwise we will confirm similar category hotel. Confirmation of the same hotels 
depends on how shortly you book the package. 
 This quotation valid in Fixed Departure Only with Limited Seats. 
 Price can be change only in Flight Part if Applicable, Confirm before advance. 

  
INCLUSIONS:. 

 
 
5% GST  
 
Round Trip Flight Fare included from Kolkata in Economy Class 
 
Visa fee & Process  
 
Nights stay at Certified 3 Star / 4 Star Hotels 
 
All Day Breakfast Lunch and Dinner 
 
Burj Khalifa top 124th Floor transfer. 
 
Dubai Frame Exclusive Ticket 
 
All 3 Times Meal (Breakfast, Lunch & Dinner) 
 
Daily 1L Water Bottle to Everyone. 
 
Private Car with A/C for airport transfers. 
 
All Sightseeing on SIC basis  
 
Kolkata to Kolkata Tour Manager in a Group  
 
First Aid On-board  
 
Road/interstate taxes, fuel surcharges.  
 
Entry ticket to above mention museum in this itinerary. 

 
The price includes petrol, tolls, road taxes, etc. 
 

EXCLUSIONS: 
 
TCS tax as per Indian Gov. (Need to Clear with Final Booking Amount) 
 
Travel Insurance 
 
Surcharges if travel from other City (Apart Kolkata) 
 
Guide if needed in your language. 
 
Laundry, telephone calls, and incidentals.  
 
Any personal expenses.  
 
Room service and special orders (Alcoholic and non-alcoholic beverages or etc.)  
 
Camera Tickets (If needed) are NOT INCLUDED 
 
Tip of Driver, Guide & Hotel if applicable 
 
Any extra excursion or sightseeing apart from suggested tour itinerary. 
 

IMPORTANT: 
We need following to process your booking: 
1. Guest Name & Contact Number 
2. Naming List with gender & age 
3. Arrival / Departure details. 

COVID – 19 PROTOCOL 

1. It is mandatory for all to wear face mask properly at all times during air travel. 
2. Travel and Visa restrictions related to Covid-19 by Bureau of Immigration, Ministry of Home 

Affairs, Government of India.  
3. In case of any Lockdown issued by the Government of India. We pay full refund of our 

package amount (Except third party service i.e. Ticket, Any safaris, etc.). 
4. When you are traveling outside of India please concern with us for valid Vaccination 

Certificate(For example some of countries no accept CVAXIN or Others). 
5. And for more please follow the Government Guidelines(India & Others Country too) 
 

BRING THE BELOW MENTIONED PARTICULARS ON ARRIVAL: 
1. Copies of the hotel vouchers which will be provided within 4-6 working days after 
confirming full payment of the package. 
2. Any one of original valid ID proof and 4 xerox copies of each person. 
Note: Valid ID proof (Passport) 
3. 4 Passport sized photographs of each person. 

PAYMENT: 

All prices are subject to availability and can be withdrawn or varied without notice. Prices quoted are subject 

to change at any time until full payment is received from the Client and tickets issued. Price changes may occur 

by reason of matters outside our control which increase the cost of the products or services. On account of such 

price change, Sunflower Trip reserves the right to recover applicable surcharges to make up for foreign 

currency fluctuations, changes in the various cross rate of exchange, fuel costs, interest rate on holiday loans 

and the like if any. Further, we reserve the right to correct any pricing errors or omissions. Prices are per 

person unless otherwise stated. 

 

About transportation 

 

Payment Particulars 
        Amount to be paid        
Date of Payment 

Interest Free Non - Refundable 
Booking Amount 

See table below 
At the time of booking 

Processing amount 
As per destination / Services 
Within 3 days of payment of Booking 
Amount 
Balance Payment 
As per destination / Services 
Within 30 days prior to Travel date. 

Amount to be paid        

India 
INR 4000/- 

S.E Asia, Middle East 
INR 7000/- 

All other Destination 
INR 15000/- 

Third Party Packages 
Based on their Policy 

Cancellation Policy 

In the event of cancellation of tour / travel services due to any avoidable / unavoidable reason/s we 
must be notified of the same in writing. Cancellation charges will be effective from the date we receive 
advice in writing, and cancellation charges would be as follows: 

 
30 days prior to arrival: 15% of the Tour / service cost 

 
15 days prior to arrival: 30% of the Tour / service cost 

 
07 days prior to arrival: 60% of the Tour / service cost 

 
72 hours prior to arrival OR No Show: No Refund 

 
Note: Written cancellation will accept on all working days, except Sunday, Any cancellation sent on 
Sunday's will be considered on next working day (Monday). 
For the X-mas and new year period from 20 Dec to 10 Jan and in India it’s also valid for Durga Puja 
& Dewali time, the payment is non-refundable. 
In case you cancel the trip after commencement, refund would be restricted to a limited amount only which too would depend on the amount that we would be able to recover from the hoteliers/ 
contractors we patronize. For unused hotel accommodation, chartered transportation & missed meals 
etc. we do not bear any responsibility to refund. 
 

Wildlife Safaris cancellation 

All the wildlife safaris booked into any of Indian Wildlife National Park/Sanctuaries 
are non refundable. Even date change request will be considered as cancellation and no 
payment will be refunded/ adjusted against it. 

BOOKING AMOUNT AND FINAL PAYMENT 

We require a minimum deposit as booking amounts as per the below chart per person at the time of booking. 

Your service provider will require amounts towards the bookings which amounts are non-refundable, non-

transferable and interest free amounts. Final payment for the relevant booking is required no later than 6 

weeks prior to departure unless otherwise stated on your invoice. Some airfares or services must be paid in full 

at the time of booking. The amounts mentioned below are mandatory, non-refundable and interest free 

booking amounts. However depending on the seasonality to the destination of travel, peak period, any events 

(such as trade fairs, exhibitions, etc), the booking amount is subject to change without prior notice. 

Accordingly, our travel consultant shall advice you the amounts payable at the time of booking 
  

Incase of third party bookings, the non-refundable booking amount shall change depending upon the 

associated partner. 
  

FORFEITURE OF BOOKING AMOUNT 
  

Sunflower Trip has the right to forfeit the booking amounts and recover cancellation charges in the event: (a) 

the tour/booking is cancelled by the Client (including on grounds of medical reasons); and/or (b) non-

adherence of payment schedule as intimated by the travel consultant to the Client. 
  

METHOD OF PAYMENT - CREDIT CARD TRANSACTIONS, ELECTRONIC TRANSFER AND 

PAYMENT BY CHEQUE, CASH 

Prices are valid for payment by Pay by Our Website, Credit card, Debit Card, Our EMI system, cash, cheque, 

bank transfer Online and UPI. Cheques are accepted but take up to four (4) business days to clear, you agree 

that you will not seek to charge back your payment to Sunflower Trip. Please note that electronic payments 

may take up to two (2) business days to process. If you are paying by this method you will need to pay at least 

two (2)business days prior to the actual due date. Please provide us with the bank confirmation number of the 

electronic payment made for faster reconciliation at our end. You must notify your consultant of your payment 

once it has been made. Where you pay by cheque, you agree not to stop payment of the cheque even when you 

cancel a booking. You agree that we may apply the proceeds of the cheque to satisfy any liability you have to 

us, including any liability in respect of cancellation fees, before refunding the balance to you. Travel documents 

will not be issued until full payment with cleared funds is received. 
  

As per the government of India regulations, customers will have to provide photocopies of their Income Tax 

PAN (Permanent Account Number) card to Sunflower Trip, for all bookings above INR 25000 in value. 

TAXES 

All monetary consideration to be paid by the Client is exclusive of Service Tax (GST), where applicable. If 

Service Tax (GST) is imposed on a supply of Services made pursuant to a booking, the recipient of that supply 

of Services i.e. the Client must pay an amount equal to the Service Tax (GST) payable in respect of that supply 

of Services. 
  

All amounts payable by the Client shall be paid free and clear of all deductions or withholdings. However, 

should either Sunflower Trip or the Client are required by Law to make a deduction or withholding from any 

amount payable for a booking, then such party will be responsible to pay the deductions or withholding and 

remit any necessary filings to the appropriate government authority. Such party shall use its reasonable efforts 

to provide evidence of the deduction or withholding to the other party so that the other party can claim a tax 

credit for such deduction or withholding. In the event that a party cannot obtain the relevant documentation 

necessary to claim a tax credit for the deduction or withholding, then the other party remains obligated to pay 

the party for the amount of tax deducted or withheld. Both Sunflower Trip and the Client agree to reasonably 

and in good faith cooperate with each other in the determination and administration of each Party's tax 

collection and remittance responsibilities. 
  

Certain taxes are mandatory in various countries. There may also be an additional local tax charged at some 

airports. All taxes are subject to change without notice. Some countries have local city/government tax which 

has to be paid directly at the hotel/services used. The same are not a part of the package cost. 

HEALTH AND TRAVEL INSURANCE 

Client must ensure that the Client is aware of any health requirements and recommended precautions relevant 

to your travel and ensure that the Client carries all necessary vaccination documentation. In some cases, failure 

topresent required vaccination documentation may deny you entry into a country. We recommend that the 

Client consult with their local doctor or travel medical service before commencing your travel. Advice on 

health requirements may be obtained from the Department of Health leaflet Advice on Health for Travelers, 

which may be obtained from the Department of Health of the country that will be visited. 
  

In case the Client decides to obtain travel insurance, it should be noted that that Sunflower Trip acts as a mere 

facilitator and that the contract of travel insurance is directly between the Client and the insurer. Client should 

check all the details of the travel insurance and in case of any error or lapse, report the same to be 

communicated to the Insurer directly and get the same rectified by them, as Sunflower Trip would not be 

responsible for the same. If the Client declines travel insurance, Client may be required to sign a disclosure. All 

Clients not possessing valid travel insurance are travelling at their own risk. 
 

FOREIGN EXCHANGE 
  

Foreign Exchange utilization for the purpose of Land arrangements/ self use will be done from the individual 

BTQ Quota only. Payments will be accepted in accordance with the rules and regulations laid down by Reserve 

Bank of India. You shall be required to provide such KYC documents as may be requested by Sunflower Trip 

at the time of booking/ receiving the booking amounts. 
  

Only the rupee value of the foreign exchange equivalent to INR 40,000/- in cash can be paid towards buying 

Forex and towards transactions involving forex remittances towards bookings/purchasing services. If the rupee 

value of the foreign exchange exceeds INR 40,000/-, then the entire amount has to be paid by Cheque, Demand 

Draft, Pay order, NEFT. 
 

AGENCY 
 

Sunflower Trip acts as a travel agent only. We sell various travel related products on behalf of numerous 
suppliers/ third party providers such as transport, accommodation and other wholesale service providers, 
airlines, coach, rail and cruise line operators. Sunflower Trip obligation is to make travel bookings on your 
behalf and to arrange relevant contracts between you and travel service providers. We exercise care in the 
selection of reputable service providers but we are not ourselves a provider of travel services and have no 
control over, or liability for, the services provided by third parties. We have no responsibility for these services 
nor do we make or give any warranty or representation regarding their standard. All bookings are made on 
Clients behalf subject to the terms and conditions, including conditions of carriage and limitations of liability 
imposed by these service providers. Your legal recourse is against the specific provider and not Sunflower Trip. 
If for any reason, any travel service provider is unable to provide the services for which you have contracted 
your remedy lies against the provider and not with Sunflower Trip. If you have any issues or problems whilst 
travelling, please contact your travel agent prior to making any adjustment to your booking. Sunflower Trip 
will not be held responsible for any costs incurred as a result of decisions made without prior agreement from 

your agent. Sunflower Trip will not be liable for any delays/deficiencies of any services provided by the 
suppliers/third party providers. 

 

BAGGAGE 
 

In all circumstances and at all times it is the sole responsibility of the Client to take care of their baggage and 

personal effects and Sunflower Trip shall not be liable for any loss of baggage/personal effects of the Client by 

airline/cruise/coach or any other carrier. It is advisable to carry valuables on person at all times and deposit the 

same in lockers, boxes etc. (whenever available). The Company or its representative/s will not be responsible 

for loss of valuables or for making good such loss. 
  

Clients traveling by air will be subject to the airline restrictions/limitation on baggage weight/size/pieces as may 

be advised by the travel consultant at the time of booking. These will be subject to change without prior notice. 
  

LIABILITY 
  

We always do our best to make sure your holiday arrangements are satisfactory. However, we cannot accept 

any liability of whatever nature, whether in contract, tort or otherwise, for the acts, omissions or default, 

whether negligent or otherwise, of these service providers, over whom we have no direct control. Under 

circumstances where liability cannot be excluded, such liability is limited to the value of that particular 

purchased travel arrangements in respect of which claims arise. We do not accept any liability in contract, tort 

or otherwise for any injury, damage, loss, delay, additional expense or inconvenience caused directly or 

indirectly by force majeure or any other event which is beyond our control or which is not preventable by 

reasonable diligence on our part. In particular, but without limitation to these conditions, we accept no 

responsibility for any loss, damage or injury you suffer as a result of terrorism, war (including civil-war), coup, 

riot, civil disturbance or any type of criminal act. It is your responsibility to inform yourself about the safety 

and security situation in the places you are travelling to. 
  

Under no circumstances shall the Company be liable to the Client and/or travellers/persons travelling with the 

Client for any personal injuries, sickness, loss of baggage or denial of visas. In any case, the Company shall not 

be liable towards any consequential loss, damage or extra costs suffered by the Client for any reasons 

whatsoever. 
  

PASSPORTS AND VISAS 
 

All individuals departing from India must be in possession of a valid passport and relevant visas. When 

assisting with international travel, Sunflower Trip assumes that all travellers have valid passports. It is your 

responsibility to ensure that you have valid documentation, including but not limited to passports, visas and re-

entry permits which meet the requirements of immigration and other government authorities. Any fines, 

penalties, payments or expenditures incurred as a result of such documents not meeting the requirements of 

those authorities will be your sole responsibility. All the expense incurred for the visa/passport interview shall 

be borne by you and is not a part of the package cost. The Client is personally responsible for ensuring that 

they have a valid passport, relevant visa/s. 
  

Issuance of visas depends on the sole discretion of the visa counsellor and Sunflower Trip shall only act as a 

representative on behalf of the Client for the purposes of submitting the visa applications and related 

documents. All the visa related application(s) and document(s) in respect of the visa processing shall be duly 

submitted to Sunflower Trip as per the relevant visa guidelines and within the time-lines, as advised by 

Sunflower Trip from time to time. In the event the visa application made by the Client or by Sunflower Trip(as 

the case may be) on his/her behalf is rejected by the visa counsellor/consulatedue to either inadequate 

supporting documents or for whatever reason or where the visa could not be processed due to late submission 

of application by the Client, Sunflower Trip shall not be liable for such rejection under any circumstances. 

Rejection of visa shall lead to forfeiture of booking amount paid and no claim whatsoever shall be entertained 

for the same. The decision of visa grant, duration of the visa validity, number of entries permitted in respect of 

each such visa as well as the time-lines for communicating visa decisions is at the sole and absolute discretion of 

the visa counsellor/consulate and Sunflower Trip shall have no liability whatsoever. 

RE-CONFIRMATION AND FLIGHT DEPARTURE TIMES 

You must reconfirm your flights and check for reschedules on your onward and return flights at least 24 hours 

prior to each journey as departure times can change. 
  

REFUND 

Sunflower Trip reserves the right to determine the quantum of refund payable in case of cancellation or 

amendment of a tour due to Force Majeure or any other circumstances. Such refund would be based on 

various factors like the number of participants, the cancellation policies of suppliers like hoteliers, airlines, 

coach operators, etc. and the decision of Sunflower Trip on the quantum of refund shall be final. Even in case 

of tour for which the payment was made in foreign currency with or without part payment in Indian rupees, 

the said refund shall be made only in Indian rupees at the prevailing buying rate of exchange on the date of 

refund as per existing Rules & Regulations. 
  

Refunds (if any) for amendments and / or cancellations will be paid directly to the Client by Sunflower Trip. In 

case of refund in foreign currency component, the said refund shall be made in Indian Rupees only at the 

prevailing buying rate on the date of refund as per existing statutes, rules and regulations. It would take at a 

minimum of sixty (60) business days to process such refunds 
  

In case of Sunflower Trip exercising its discretionary rights to alter, amend or cancel any tour or holiday 

advertised, the Client who has booked for such tour can exercise one of the following options: 

 
To continue with the tour as altered or amended; or 

 
To accept any alternative tour, which Sunflower Trip may offer; or 

 
To unconditionally accept the return of the tour cost charges (after deduction of the actual expenses 

incurred by us on your booking like visa, travel insurance, ticket voiding charges and other overheads as 

applicable from case to case) in full and final settlement and Sunflower Trip shall not be liable to pay the 

Client, compensation, consequential loss, damages, additional expenses or interest charges over and above 

as is computed by Sunflower Trip as per these 'Terms & Conditions'. The Client will not be entitled to 

make any grievance or any claims thereafter in respect of the same. 
  

In case of the Client travelling on an amended tour, the legal relation between the parties shall not change only 

by virtue of the altered/amendment. The Client opting to continue with the tour arrangements as altered or 

amended shall pay additional charges, if any, levied by Sunflower Trip. 
  

There shall be no refund if the Client does not or cannot utilise any service included in the tour cost or paid for 

services like meals, rooms, entry tickets, excursions etc., nor can any refund be made for lost, mislaid or 

destroyed travel tickets or vouchers. 
  

In any case, the Company shall not be liable towards any consequential loss, damage or extra costs suffered by 

the Client for any reasons whatsoever. 
  

TRAVEL DOCUMENTS 

 
Travel documents include (without limitation) airline tickets, hotel vouchers, tour vouchers or any other 
document (whether in electronic form or otherwise) used to confirm a travel and accommodation related 
arrangement with a service provider. Travel documents may be subject to certain conditions and/or 
restrictions including (without limitation) being non-refundable, non-date-changeable and subject to 
cancellation and/or amendment fees. All travel documents are non-transferable. All airline tickets must be 
issued in the name of the passport/photo identity holder, some carriers will deny carriage if the name varies 
between the travel documents and the airline tickets and the booking may be cancelled subject to cancellation 
charges. Please review your travel documentation carefully and advise us immediately of any errors in the 
details as set out in the Checklist. Any errors in names on your travel documentation will be your responsibility 
if not advised at the time of booking. It is your responsibility to collect all travel documents from us prior to 
travel. 
 

PRIVACY POLICY 
 

Sunflower Trip is committed to protecting the privacy and confidentiality of personal information. Click here to 

view our Privacy Policy. 
  

Our Privacy Policy is available for viewing at www.thesunflowertrip.com/privacy or in store. 

 

PARTICIPATION ON TOURS, PUNCTUALITY, MEALS, ETC. 
  

Sunflower Trip is not responsible for any liability including missed sightseeing or subjecting to alternate travel 

arrangements, if you fail to meet the local concerned representative at assigned timings and pick-up points. 

Sunflower Trip shall also not refund any cost or expenses incurred for termination of services to be provided 

due to unacceptable behaviour on tour/services. 

 
  

. 
  

AGREEMENT 
  

By signing these Terms and Conditions and payment of booking amounts, the Client (either through himself or 

its representative) accepts the booking conditions mentioned herein, not only on his behalf but on behalf of all 

the travellers/persons mentioned in the Checklist. The signing of the Terms and Conditions shall mean 

acceptance by the Client in totality of the Terms and Conditions contained herein. Sunflower Trip reserves the 

right to decline to book any person/s without assigning any reason whatsoever. Signing of the Terms and 

Conditions shall legally bind the parties into a contract. 
  

Until Sunflower Trip has received the amount specified as non-refundable interest free booking amount in 

Booking Amounts and Final Payments above, there shall be no legal and binding contract between the parties. 

The payment in full shall be received as per the procedure mentioned in Deposits and final payments above. In 

case of any deviation with the process of payment Sunflower Trip reserves the right to terminate the booking 

with resultant forfeiture of booking amount and apply cancellation charges as may be applicable from time to 

time. Any payment made by the Client would not constitute payment to Sunflower Trip until the same is 

remitted to the account of Sunflower Trip. 
  

It is hereby declared that the immunities provided under these Terms and Conditions shall be available to the 

Company's Directors, employees, officers and Agents. No person including the employee/s and the agent/s of 

the Company even in writing has the authority to alter, amend, modify or waive any stipulation, 

representation, term or condition set forth in this document. Also assurance of any service or facility given by 

any employee/ agent of the Company, which is contrary to what is set forth in the brochure, price grid, and 

invoice, shall not be binding on the Company under any circumstance whatsoever. All tours are subject to 

prevailing laws, rules of RBI/GOI. Rights of admission to the tour expressly reserved. 
  

Client hereby agrees to waive any rights to challenge the validity or enforceability of these Terms and 

Conditions on the ground that the agreement created by acceptance of these Terms and Conditions was made 

electronically. 
  

BANK ACCOUNT DETAILS 

SUNFLOWER  TRIP  PVT.  LTD. 
A/C No : 695005500372 
IFSC Code : ICIC0006950 
Branch : Kolkata Salt Lake Sector 1  
 
A/C Type : CURRENT A/C 
Bank : ICICI Bank 
 `;

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
    // if (this.tour?.location) {
    //   // Example logic: adjust based on location
    //   if (['Europe', 'Asia'].includes(this.tour.location)) {
    //     monthsToAdd = 4;
    //   }
    // }
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
    this.agreeTerms = false;
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
    if (form.valid && this.agreeTerms) {
         this.stateSvc.setBooking(this.bookingData);
      this.onSubmitBooking.emit({ ...this.bookingData, tourId: this.tour?.id });
      this.closeModal();
    }
  }
}
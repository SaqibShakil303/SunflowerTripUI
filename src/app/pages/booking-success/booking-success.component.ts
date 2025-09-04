import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule],

    template: `
    <h2>Payment Successful 🎉</h2>
    <p>Booking ID: {{bookingId}}</p>
    <p *ngIf="paymentId">Payment ID: {{paymentId}}</p>
    <a routerLink="/">Back to Home</a>
  `

})
export class BookingSuccessComponent {
  bookingId: string | null = null;
  paymentId: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId');
    this.paymentId = this.route.snapshot.queryParamMap.get('paymentId');
  }
}

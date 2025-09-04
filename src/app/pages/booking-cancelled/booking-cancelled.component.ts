import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-cancelled',
  standalone: true,
  imports: [],
template: `
    <h2>Payment Not Completed</h2>
    <p>Reason: {{reason || 'Cancelled/Failed'}}</p>
    <a routerLink="/">Try again</a>
  `
})
export class BookingCancelledComponent {
  reason: string | null;
  constructor(private route: ActivatedRoute) {
    this.reason = this.route.snapshot.queryParamMap.get('reason');
  }
}

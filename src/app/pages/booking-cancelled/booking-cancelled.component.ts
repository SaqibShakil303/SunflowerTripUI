import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-booking-cancelled',
  standalone: true,
  imports: [],
  templateUrl: './booking-cancelled.component.html',
  styleUrls: ['./booking-cancelled.component.scss']
})
export class BookingCancelledComponent {
  reason: string | null;

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.reason = this.route.snapshot.queryParamMap.get('reason');
  }

  goBack() {
    this.location.back();
  }
}
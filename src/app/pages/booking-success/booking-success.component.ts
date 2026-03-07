import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StatePersistenceService } from '../../services/state-persistence/state-persistence.service';
import { Tour } from '../../models/tour.model';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-success.component.html',
  styleUrls: ['./booking-success.component.scss']
})
export class BookingSuccessComponent implements OnInit {
  bookingId: string | null = null;
  paymentId: string | null = null;
  bookingData: any = {};
  tour: Tour | null = null;

  constructor(private route: ActivatedRoute, private stateSvc: StatePersistenceService,   private router: Router) {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId');
    this.paymentId = this.route.snapshot.queryParamMap.get('paymentId');
  }

  ngOnInit() {
    const stored = this.stateSvc.booking || {};
    this.bookingData = stored;
    this.tour = stored.tour || null;
  }

   goHome() {
    this.router.navigate(['/']);
        this.stateSvc.clearBooking // Clear booking data when navigating home
  }
   goToDashboard() {
    this.router.navigate(['customer-dashboard/account']);
        this.stateSvc.clearBooking // Clear booking data when navigating home
  }
}
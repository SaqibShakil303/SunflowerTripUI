import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-booking-cancelled',
  standalone: true,
  imports: [],
  templateUrl: './booking-cancelled.component.html',
  styleUrls: ['./booking-cancelled.component.scss']
})
export class BookingCancelledComponent implements OnInit {
  reason: string | null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private snackBar: MatSnackBar
  ) {
    this.reason = this.route.snapshot.queryParamMap.get('reason');
  }

  ngOnInit(): void {
    this.snackBar.open('Your Booking created successfully. Please login to your account.', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  goBack() {
    this.location.back();
  }
}
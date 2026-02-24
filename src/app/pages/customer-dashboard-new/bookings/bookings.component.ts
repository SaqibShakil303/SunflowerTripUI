import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent {
  showBoookingDetails: boolean = false;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  toggleBookingDetails() {
    this.showBoookingDetails = !this.showBoookingDetails;
    if(!isPlatformBrowser(this.platformId)) return;
    if (this.showBoookingDetails) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  }
}

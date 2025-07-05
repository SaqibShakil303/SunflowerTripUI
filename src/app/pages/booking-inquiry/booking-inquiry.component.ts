import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-booking-inquiry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-inquiry.component.html',
  styleUrl: './booking-inquiry.component.scss'
})
export class BookingInquiryComponent {
  packages = ['Bali Bliss', 'Thailand Explorer', 'European Delight'];

  submitForm() {
    // Send data to backend
    // this.toastr.success('Your inquiry has been submitted!');
  }
  
}

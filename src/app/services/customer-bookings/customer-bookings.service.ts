import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.prod';
import { BookingDetailsResponse, MyBookingItem, Traveller } from '../../models/booking.model';


@Injectable({ providedIn: 'root' })
export class CustomerBookingsService {
  private base = environment.apiDomain; 

  constructor(private http: HttpClient) {}


  private authHeaders() {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return { headers };
  }


  getMyBookings() {
    return this.http.get<MyBookingItem[]>(`${this.base}/bookings/my`, this.authHeaders());
  }

  getBookingDetails(id: number) {
    return this.http.get<BookingDetailsResponse>(`${this.base}/bookings/${id}`, this.authHeaders());
  }

  addTravellers(bookingId: number, travellers:  Partial<Traveller>[]) {
    return this.http.post<{ ok: boolean; added: number }>(
      `${this.base}/bookings/${bookingId}/travellers`,
      { travellers },
      this.authHeaders()
    );
  }

   listTravellers(bookingId: number) {
    return this.http.get<Traveller[]>(`${this.base}/bookings/${bookingId}/travellers`, this.authHeaders());
  }
}
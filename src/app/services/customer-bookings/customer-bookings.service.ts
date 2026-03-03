import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.prod';


@Injectable({ providedIn: 'root' })
export class CustomerBookingsService {
  private base = environment.apiDomain; 

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('token'); // adjust if you store differently
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  getMyBookings() {
    return this.http.get<any[]>(`${this.base}/bookings/my`, this.authHeaders());
  }

  getBookingById(id: number) {
    return this.http.get<any>(`${this.base}/bookings/${id}`, this.authHeaders());
  }

  addTravellers(bookingId: number, travellers: any[]) {
    return this.http.post(`${this.base}/bookings/${bookingId}/travellers`, { travellers }, this.authHeaders());
  }

  listTravellers(bookingId: number) {
    return this.http.get<any[]>(`${this.base}/bookings/${bookingId}/travellers`, this.authHeaders());
  }
}
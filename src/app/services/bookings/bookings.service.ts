import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.dev';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Booking } from '../../models/booking.model';

interface RawBooking {
  id?: number;
  tour_id: number;
  name: string;
  email: string;
  phone: string;
  days?: number;
  adults: number;
  children: number;
  child_ages?: string; // JSON string from API
  hotel_rating: string;
  meal_plan: string;
  flight_option?: string;
  flight_number?: string;
  travel_date: string;
  created_at?: string; // API may return string
}
@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  apiUrl = environment.apiDomain;

  constructor(private http: HttpClient) {}

  submitEnquiry(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Contact/enquiries`, data).pipe(
      catchError(this.handleError)
    );
  }

  submitBooking(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Contact/bookings`, data).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ GET all enquiries
  getAllEnquiries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Contact/GetAllEnquiries`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ DELETE enquiry by ID
  deleteEnquiry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Contact/deleteEnquiry/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ GET all bookings
 getAllBookings(): Observable<Booking[]> {
    return this.http.get<RawBooking[]>(`${this.apiUrl}/Contact/GetAllBookings`).pipe(
     map(bookings =>
        bookings.map(booking => ({
          ...booking,
          child_ages: booking.child_ages ? JSON.parse(booking.child_ages).map((age: string) => Number(age)) : [],
          created_at: booking.created_at ? new Date(booking.created_at) : undefined
        } as Booking))
      )
    );
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Contact/deleteBooking/${id}`);
  }
  // ❗️Centralized error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.error) {
        errorMessage = error.error.error;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.dev';
import { catchError, Observable, throwError } from 'rxjs';

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
  deleteEnquiry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Contact/deleteEnquiry/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ GET all bookings
  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Contact/GetAllBookings`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ DELETE booking by ID
  deleteBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Contact/deleteBooking/${id}`).pipe(
      catchError(this.handleError)
    );
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

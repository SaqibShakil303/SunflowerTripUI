import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.dev';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
apiUrl = environment.apiDomain;
  constructor(private http: HttpClient) { }
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.error) {
        errorMessage = error.error.error; // Use backend error message if available
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}

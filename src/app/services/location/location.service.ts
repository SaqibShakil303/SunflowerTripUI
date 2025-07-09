import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environments.dev';
import { LocationModel } from '../../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient,) { }

  private apiUrl = environment.apiDomain;

  addLocation(data: Partial<LocationModel>): Observable<any> {
    return this.http.post(`${this.apiUrl}/locations`, data).pipe(
      catchError(this.handleError)
    );
  }

  getAllLocations(): Observable<LocationModel[]> {
    return this.http.get<LocationModel[]>(`${this.apiUrl}/locations`);
  }

  updateLocation(data: Partial<LocationModel>): Observable<LocationModel> {
    return this.http.put<LocationModel>(`${this.apiUrl}/locations/${data.id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/locations/${id}`).pipe(
      catchError(this.handleError)
    );
  }

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

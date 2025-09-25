import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, shareReplay, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environments.dev';
import { LocationModel } from '../../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient,) { }

  private apiUrl = environment.apiDomain;

   private imageUrlCache = new Map<number, string>();

  addLocation(data: Partial<LocationModel>): Observable<any> {
    return this.http.post(`${this.apiUrl}/locations`, data).pipe( //timeout(8000),
      catchError(this.handleError)
    );
  }

  getAllLocations(): Observable<LocationModel[]> {
    return this.http.get<LocationModel[]>(`${this.apiUrl}/locations`).pipe( //timeout(8000),
      catchError(this.handleError)
    );
  }

  getLocationImageUrl(id: number): Observable<string> {
    const cached = this.imageUrlCache.get(id);
    if (cached) return new Observable<string>(o => { o.next(cached); o.complete(); });

    return this.http.get(`${this.apiUrl}/locations/${id}/image`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map((res: HttpResponse<Blob>) => {
        const blob = res.body!;
        const url = URL.createObjectURL(blob);
        this.imageUrlCache.set(id, url);
        return url;
      }),
      // replay so multiple subscribers don’t duplicate network
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** Optional: clear one cached image (e.g., on edit) */
  clearCachedImage(id: number) {
    const url = this.imageUrlCache.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      this.imageUrlCache.delete(id);
    }
  }

  updateLocation(data: Partial<LocationModel>): Observable<LocationModel> {
    return this.http.put<LocationModel>(`${this.apiUrl}/locations/${data.id}`, data).pipe( //timeout(8000),
      catchError(this.handleError)
    );
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/locations/${id}`).pipe( //timeout(8000),
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

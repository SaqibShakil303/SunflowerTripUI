import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TripPlannerComponent } from '../../common/trip-planner/trip-planner.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tripPlanner } from '../../models/tripPlanner.model';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environments.dev';
import { TripLead } from '../../models/tripLead.model';

@Injectable({
  providedIn: 'root'
})
export class TripPlannerService {

  constructor(private http: HttpClient,private dialog: MatDialog) { }
private apiUrl =environment.apiDomain


   openModal(): void {
    this.dialog.open(TripPlannerComponent, {
      width: '600px',
      panelClass: 'trip-modal-panel',
      backdropClass: 'blur-backdrop',
      disableClose: false
    });
  }

 postTripPlan(data: tripPlanner): Observable<any> {
    return this.http.post(`${this.apiUrl}/trip-leads`, data);
  }

getAllTripLeads(): Observable<TripLead[]> {
    return this.http.get<TripLead[]>(`${this.apiUrl}/trip-leads`).pipe(
      map(tripLeads =>
        tripLeads.map(lead => ({
          ...lead,
          aged_persons: lead.aged_persons || []
        }))
      ),
      catchError(this.handleError)
    );
  }

  deleteTripLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/trip-leads/${id}`).pipe(
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

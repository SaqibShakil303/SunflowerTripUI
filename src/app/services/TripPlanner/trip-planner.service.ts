import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TripPlannerComponent } from '../../common/trip-planner/trip-planner.component';
import { HttpClient } from '@angular/common/http';
import { tripPlanner } from '../../models/tripPlanner.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';

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

  getAllTripPlans(): Observable<tripPlanner[]> {
    return this.http.get<tripPlanner[]>(this.apiUrl);
  }
}

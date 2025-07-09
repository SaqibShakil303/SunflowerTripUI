import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient,) { }

  private apiUrl = environment.apiDomain;

  // getAllLocations(): Observable<Location[]> {
  //   return this.http.get<Location[]>(`${this.apiUrl}/Tours`);
  // }
}

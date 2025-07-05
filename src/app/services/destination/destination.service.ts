import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';
import { Activity, Attraction, Cuisine, Destination, Ethnicity } from '../../models/destination.model';
export interface DestinationNav {
  parent_id: null;
  id: number;
  title: string;
  locations: { id: number; name: string }[];
}

// Interface for the backend payload
export interface DestinationPayload {
  destination: {
    title: string;
    parent_id: number | null;
    image_url: string;
    best_time_to_visit: string;
    weather: string;
    currency: string;
    language: string;
    time_zone: string;
    description: string;
  };
  locations: Location[];
  attractions: Attraction[];
  ethnicities: Ethnicity[];
  cuisines: Cuisine[];
  activities: Activity[];
  itinerary_blocks?: { title: string; description: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class DestinationService {

 constructor(private http: HttpClient,
    @Inject(PLATFORM_ID
    ) private platformId: Object
  ) { }
private APIurl =environment.apiDomain


getDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.APIurl}/Destination`);  
  }

  getDestinationNames(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.APIurl}/Destination/destinationNames`);
  }
 getDestinationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.APIurl}/${id}/details`);
  }
   getDestinationByTitle(title: string): Observable<any> {
    return this.http.get<any>(`${this.APIurl}/Destination/${title}`);
  }
  
 getDestinationDetails(id: number): Observable<Destination> {
  return this.http.get<Destination>(`${this.APIurl}/Destination/${id}/details`);
}
 getNamesAndLocations(): Observable<DestinationNav[]> {
    return this.http.get<DestinationNav[]>(`${this.APIurl}/Destination/names`);
  }

  addDestination(destinationPayload: DestinationPayload): Observable<any> {
  return this.http.post(`${this.APIurl}/Destination/AddDestinationWithDetails`, destinationPayload);
}

updateDestination(id: number, destinationPayload: any): Observable<any> {
  return this.http.patch(`${this.APIurl}/Destination/update/${id}`, destinationPayload);
}
  
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Itinerary } from '../../models/itinerary.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ItineraryService {

  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  private APIurl = environment.apiDomain
  // submitItineraryDetail(f: Itinerary): Observable<any> {
  //    const payload = {
  //   name:   f.name,
  //   email:  f.email,
  //   phone:  f.phone,
  //   destination: f.destination,
  //   travelers: f.travelers,
  //   children: f.children,
  //   childAges: f.childAges,
  //   duration: f.duration,
  //   date: f.date,
  //   budget: f.budget,
  //   hotelCategory: f.hotelCategory,
  //   travelType: f.travelType,
  //   occupation: f.occupation,
  //   preferences: f.preferences


  // };
  //     console.log('🪂 Sending payload to API:', payload);
  // return this.http.post(`${this.APIurl}/Itinerary/AddItinerary`, f);
  // //  return from(
  // //   this.api 
  // //     .post('/Itinerary/AddItinerary', payload)
  // //     .then(r => r.data)
  // // );
  // }
  submitItineraryDetail(itinerary: Itinerary): Observable<any> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.post(`${this.APIurl}/Itinerary/AddItinerary`, itinerary);
    } else {
      // Handle server-side case (e.g., mock response or throw error)
      throw new Error('HTTP requests are not supported on the server');
    }
  }
  getItineraries(): Observable<Itinerary[]> {
    return this.http.get<Itinerary[]>(`${this.APIurl}/Itinerary/GetItineraries`);
  }

  deleteItinerary(id: number): Observable<any> {
    return this.http.delete(`${this.APIurl}/Itinerary/DeleteItinerary/${id}`);
  }
}

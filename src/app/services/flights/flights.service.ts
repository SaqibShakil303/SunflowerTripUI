import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environments.prod';
import { map, of } from 'rxjs';

export interface Airport { iata:string; name:string; city?:string; country?:string; type?:'AIRPORT'|'CITY'; }
export interface FlightSegment { from:string; to:string; depart:string; arrive:string; flightNo:string; duration:string; }
export interface FlightCard {
  id:string; price:number; currency:string;
  carriers:string[]; itineraries:FlightSegment[][];
}

@Injectable({ providedIn: 'root' })
export class FlightsService {
  private http = inject(HttpClient);
  private base = environment.apiDomain

  // airports(q:string, includeCity=false) {
  //   const params = new HttpParams()
  //   .set('q', q)
  //   .set('includeCity', String(includeCity));
  //   return this.http.get<Airport[]>(`${this.base}/flights/airports`, { params});
  // }

  // flights.service.ts
airports(term: string, includeCity = true) {
  if (!term || term.trim().length < 2) return of([]); // import { of } from 'rxjs';

  const params = {
    term: term.trim(),
    locale: 'en',
    // Return both airport + city (gives "London (Any)" etc.)
    'types[]': includeCity ? ['city', 'airport'] : ['airport'],
  };

  // Travelpayouts endpoint (no API key needed for autocomplete)
  const url = 'https://autocomplete.travelpayouts.com/places2';

  return this.http.get<any[]>(url, { params }).pipe(
    map(list =>
      (list || [])
        // Some entries have no code; keep those that have IATA-like code
        .filter(x => !!x.code)
        .map(x => ({
          iata: String(x.code).toUpperCase(),                 // e.g., DPS, LON, KUL
          name: x.name,                                       // airport or city display name
          city: x.city_name || x.name,                        // best-effort city
          country: x.country_name,
          // normalize type to your existing union
          type: (x.type === 'airport' ? 'AIRPORT' : 'CITY') as 'AIRPORT'|'CITY',
        }))
    )
  );
}


  search(body: {
    from:string; to:string; depart:string; ret?:string;
    adults?:number; children?:number; infants?:number;
    cabin?:'ECONOMY'|'PREMIUM_ECONOMY'|'BUSINESS'|'FIRST';
    currency?:string; nonStop?:boolean; max?:number;
  }) {
    return this.http.post<{count:number; results:FlightCard[]}>(`${this.base}/flights/search`, body);
  }
}

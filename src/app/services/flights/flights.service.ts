import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environments.prod';

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

  airports(q:string, includeCity=false) {
    const params = new HttpParams().set('q', q).set('includeCity', includeCity);
    return this.http.get<Airport[]>(`${this.base}/flights/airports`, { params });
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

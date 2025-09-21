// src/app/services/checkout.service.ts
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments.prod';
import { isPlatformBrowser } from '@angular/common';
declare var Razorpay: any;

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(private http: HttpClient,@Inject(PLATFORM_ID) private platformId: Object) {}

  apiUrl = environment.apiDomain;
  create(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/checkout/create`, payload);
  
  }
  verify(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/checkout/verify`, payload);
 
  }
consumeSeats(payload: { tourId: number; departure_id: number; seats: number; }) {
  return this.http.post(`${this.apiUrl}/booking/consume-seats`, payload);
}
 /** Load Razorpay only when a real DOM exists. No-op otherwise. */
  loadScript(): Promise<void> {
    // Hard guard 1: SSR / no window
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      isPlatformBrowser(this.platformId);

    if (!isBrowser) {
      // SSR path — do nothing; pretend it loaded
      return Promise.resolve();
    }

    // Hard guard 2: element might not exist yet if called too early
    try {
      if (document.getElementById('rzp-script')) {
        return Promise.resolve();
      }
    } catch {
      // If document access throws for any reason, treat as SSR
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const s = document.createElement('script');
        s.id = 'rzp-script';
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Razorpay script failed to load'));
        document.body.appendChild(s);
      } catch (e) {
        // If DOM ops fail for any reason, don’t crash SSR/hydration
        resolve();
      }
    });
  }
}

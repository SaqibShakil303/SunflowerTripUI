import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

function safeParse(json: string | null) {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

@Injectable({ providedIn: 'root' })
export class StatePersistenceService {
  private isBrowser = typeof window !== 'undefined' && !!window.localStorage;

  private enquiryState$ = new BehaviorSubject<any>(
    this.isBrowser ? safeParse(localStorage.getItem('enquiry')) : {}
  );
  private bookingState$ = new BehaviorSubject<any>(
    this.isBrowser ? safeParse(localStorage.getItem('booking')) : {}
  );
  private filterState$ = new BehaviorSubject<any>(
    this.isBrowser ? safeParse(localStorage.getItem('filter')) : {}
  );

  get enquiry() {
    return this.enquiryState$.value;
  }

  get booking() {
    return this.bookingState$.value;
  }

  get filter() {
    return this.filterState$.value;
  }

  enquiry$ = this.enquiryState$.asObservable();
  booking$ = this.bookingState$.asObservable();
  filter$ = this.filterState$.asObservable();

  setEnquiry(data: any) {
    this.enquiryState$.next(data);
    if (this.isBrowser) localStorage.setItem('enquiry', JSON.stringify(data));
  }

  setBooking(data: any) {
    this.bookingState$.next(data);
    if (this.isBrowser) localStorage.setItem('booking', JSON.stringify(data));
  }

  setFilter(data: any) {
    this.filterState$.next(data);
    if (this.isBrowser) localStorage.setItem('filter', JSON.stringify(data));
  }

  clear() {
    this.setEnquiry({});
    this.setBooking({});
    this.setFilter({});
  }
}

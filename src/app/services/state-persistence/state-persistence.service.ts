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


  private tourState$ = new BehaviorSubject<any>(
    this.isBrowser ? safeParse(localStorage.getItem('tour')) : {}
  );
  private destinationState$ = new BehaviorSubject<any>(
    this.isBrowser ? safeParse(localStorage.getItem('destination')) : {}
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

  get tour() {
    return this.tourState$.value;
  }
  get destination() {
    return this.destinationState$.value;
  }


  enquiry$ = this.enquiryState$.asObservable();
  booking$ = this.bookingState$.asObservable();
  filter$ = this.filterState$.asObservable();
  tour$ = this.tourState$.asObservable();
  destination$ = this.destinationState$.asObservable();

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

  setTour(data: any) {
    this.tourState$.next(data);
    if (this.isBrowser) localStorage.setItem('tour', JSON.stringify(data));
  }

  setDestination(data: any) {
    this.destinationState$.next(data);
    if (this.isBrowser) localStorage.setItem('destination', JSON.stringify(data));
  }

  clearTour() {
    this.setTour({});
  }

  clearDestination() {
    this.setDestination({});
  }

  clear() {
    this.setEnquiry({});
    this.setBooking({});
    this.setFilter({});
    this.setTour({});
    this.setDestination({});
  }
}

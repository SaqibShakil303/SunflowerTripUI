import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DestinationService } from '../../services/destination/destination.service';
import { TourService } from '../../services/tours/tour.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { StatePersistenceService } from '../../services/state-persistence/state-persistence.service';
import { FlightsService, Airport } from '../../services/flights/flights.service';

@Component({
  selector: 'app-tour-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './tour-filter.component.html',
  styleUrl: './tour-filter.component.scss'
})
export class TourFilterComponent implements OnInit {
  @Output() searchTriggered = new EventEmitter<any>();
  @HostListener('window:resize', ['$event'])
   mode: 'tours' | 'flights' = 'tours';

    // FLIGHT STATE
  fromAirportText = '';
  toAirportText = '';
  fromIATA = '';
  toIATA = '';
  fromOptions: Airport[] = [];
  toOptions:   Airport[] = [];

  departDate = '';
  returnDate = '';
  adults = 1;
  children = 0;
  infants = 0;
  cabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST' = 'ECONOMY';
  nonStop = false;

    private airportTimer?: any;

  onResize(event: any) {
    // Close dropdowns on resize to prevent positioning issues
    this.closeAllDropdowns();
  }
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.closeAllDropdowns();
  }

  // City & Destination
  fromCity: string = 'Kolkata';
  fromCityCountry: string = 'India';
  destinations: any[] = [];
  categories: string[] = [];
  selectedDestination: any | null = null;
  // selectedLocation: any | null = null;
  selectedCategory: string | null = null;
  displayedFilters: any = null;

  // Calendar
  selectedDate: Date | null = null;
  today = new Date();
  currentMonth = new Date();
  nextMonth = new Date();
  dateOpen = false;
  calendarDays: { [key: string]: (Date | null)[] } = {};

  // Filter
  dropdownOpen = false;
  durationRange: number[] = [2, 18];
  budgetRange: number[] = [10000, 125000];
  filterChips: { label: string; type: string }[] = [];

  // Default values for comparison
  private readonly defaultDurationRange: number[] = [2, 18];
  private readonly defaultBudgetRange: number[] = [10000, 125000];

  constructor(
    private destSvc: DestinationService,
    private toursSvc: TourService,
    private route: ActivatedRoute,
    private router: Router  // Add Router injection
    ,
       private flightsSvc: FlightsService  ,
    private stateSvc: StatePersistenceService
  ) {
    this.initializeCalendar();
  }
    setMode(m: 'tours' | 'flights') {
    this.mode = m;
    this.closeAllDropdowns();
  }

  // AUTOCOMPLETE HANDLERS
onAirportType(which: 'from'|'to') {
  clearTimeout(this.airportTimer);
  this.airportTimer = setTimeout(() => {
    const q = which==='from' ? this.fromAirportText : this.toAirportText;
    if (!q || q.trim().length < 2) {
      if (which==='from') this.fromOptions = []; else this.toOptions = [];
      return;
    }
    this.flightsSvc.airports(q, true).subscribe(list => {
      if (which==='from') this.fromOptions = list; else this.toOptions = list;
    });
  }, 250);
}

pickAirport(which: 'from'|'to', a: Airport) {
  if (which==='from') {
    this.fromAirportText = `${a.city || a.name} (${a.iata})`;
    this.fromIATA = a.iata; this.fromOptions = [];
  } else {
    this.toAirportText = `${a.city || a.name} (${a.iata})`;
    this.toIATA = a.iata; this.toOptions = [];
  }
}

trackByIata = (_: number, a: Airport) => a.iata;

// SEARCH FLIGHTS → navigate to /flights with query params
searchFlights(){
  const from = this.fromIATA || (this.fromAirportText?.trim().length===3 ? this.fromAirportText.trim().toUpperCase() : '');
  const to   = this.toIATA   || (this.toAirportText?.trim().length===3 ? this.toAirportText.trim().toUpperCase() : '');
  if (!from || !to || !this.departDate) return;

  this.router.navigate(['/flights'], {
    queryParams: {
      from, to,
      depart: this.departDate,
      ...(this.returnDate ? { ret: this.returnDate } : {}),
      adults: this.adults, children: this.children, infants: this.infants,
      cabin: this.cabin, nonStop: this.nonStop, currency: 'INR'
    }
  });

  // optional emit if parent listens:
  this.searchTriggered.emit({ mode:'flights', from, to, depart:this.departDate, ret:this.returnDate,
    adults:this.adults, children:this.children, infants:this.infants, cabin:this.cabin, nonStop:this.nonStop, currency:'INR' });
}

  ngOnInit() {
    const saved = this.stateSvc.filter;
    if (saved) {
      this.durationRange = saved.durationRange || this.durationRange;
      this.budgetRange = saved.budgetRange || this.budgetRange;
      this.selectedDate = saved.selectedDate ? new Date(saved.selectedDate) : this.selectedDate;
      this.selectedCategory = saved.selectedCategory || this.selectedCategory;
      this.selectedDestination = saved.selectedDestination || this.selectedDestination;
      // this.selectedLocation = saved.selectedLocation || this.selectedLocation;
    }
    this.destSvc.getDestinationNames().subscribe({
      next: (data) => {
        // this.destinations = data.filter(d => d.parent_id !== null);
        this.destinations = data;
        // console.log('DEBUG - Loaded destinations:', data);
        this.initializeFiltersFromQueryParams();
      },
      error: (err) => console.error('Failed loading destinations', err)
    });

    this.toursSvc.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed loading categories', err)
    });
  }

  initializeFiltersFromQueryParams() {
    this.route.queryParams.subscribe(params => {
      // console.log('DEBUG - Query params received:', params);

      const locationId = params['location'] ? +params['location'] : null;
      const destinationId = params['destination'] ? +params['destination'] : null;

      // console.log('DEBUG - Parsed locationId:', locationId);
      // console.log('DEBUG - Parsed destinationId:', destinationId);
      // console.log('DEBUG - Available destinations:', this.destinations);

      if (locationId || destinationId) {
        // Find destination and location based on IDs
        if (locationId) {
          for (const dest of this.destinations) {
            // console.log('DEBUG - Checking destination:', dest);
            const loc = dest.locations.find((l: any) => l.id === locationId);
            // console.log('DEBUG - Found location:', loc);
            if (loc) {
              this.selectedDestination = dest;
              // this.selectedLocation = loc;
              // console.log('DEBUG - Set selectedDestination:', this.selectedDestination);
              // console.log('DEBUG - Set selectedLocation:', this.selectedLocation);
              break;
            }
          }
        } else if (destinationId) {
          this.selectedDestination = this.destinations.find(d => d.id === destinationId) || null;
          // this.selectedLocation = null;
          // console.log('DEBUG - Set selectedDestination (destination only):', this.selectedDestination);
        }

        // Trigger search with current filters
        this.searchTours();
      }
    });
  }

  // Calendar Implementation
  initializeCalendar() {
    const now = new Date();
    this.currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    this.nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  generateCalendarDays() {
    this.calendarDays = {};
    [this.currentMonth, this.nextMonth].forEach(month => {
      const key = this.getMonthKey(month);
      this.calendarDays[key] = this.calculateDaysForMonth(month);
    });
  }

  getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }

  calculateDaysForMonth(monthDate: Date): (Date | null)[] {
    const days: (Date | null)[] = [];
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.nextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  nextMonths() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.nextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  toggleDate(event: Event) {
    event.stopPropagation();
    this.closeOtherDropdowns('date');
    this.dateOpen = !this.dateOpen;

    if (this.dateOpen) {
      this.generateCalendarDays();
    }
  }

  selectDate(date: Date | null) {
    if (!date || date < this.today) return;

    this.selectedDate = new Date(date);
    setTimeout(() => {
      this.dateOpen = false;
      // this.searchTours();
    }, 100);
  }

  getDayName(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  }

  getMonthYear(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getCalendarDays(monthDate: Date): (Date | null)[] {
    const key = this.getMonthKey(monthDate);
    return this.calendarDays[key] || [];
  }

  // Filter dropdown
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.closeOtherDropdowns('filter');
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeOtherDropdowns(except?: string) {
    if (except !== 'date') this.dateOpen = false;
    if (except !== 'filter') this.dropdownOpen = false;
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedCategory !== null ||
      this.selectedDestination !== null ||
      // this.selectedLocation !== null ||
      this.selectedDate !== null ||
      this.fromCity !== 'Kolkata' ||
      this.durationRange[0] !== this.defaultDurationRange[0] ||
      this.durationRange[1] !== this.defaultDurationRange[1] ||
      this.budgetRange[0] !== this.defaultBudgetRange[0] ||
      this.budgetRange[1] !== this.defaultBudgetRange[1]
    );
  }

  validateDurationRange() {
    if (this.durationRange[0] > this.durationRange[1]) {
      [this.durationRange[0], this.durationRange[1]] = [this.durationRange[1], this.durationRange[0]];
    }
  }

  validateBudgetRange() {
    if (this.budgetRange[0] > this.budgetRange[1]) {
      [this.budgetRange[0], this.budgetRange[1]] = [this.budgetRange[1], this.budgetRange[0]];
    }
  }

  applyFilters() {
    this.dropdownOpen = false;

    const chips: { label: string; type: string }[] = [];

    if (this.durationRange[0] !== this.defaultDurationRange[0] ||
      this.durationRange[1] !== this.defaultDurationRange[1]) {
      chips.push({ label: `${this.durationRange[0]}-${this.durationRange[1]} nights`, type: 'duration' });
    }
    if (this.budgetRange[0] !== this.defaultBudgetRange[0] ||
      this.budgetRange[1] !== this.defaultBudgetRange[1]) {
      chips.push({ label: `₹${this.budgetRange[0].toLocaleString()}-₹${this.budgetRange[1].toLocaleString()}`, type: 'budget' });
    }

    this.filterChips = chips;

    this.displayedFilters = {
      duration: this.durationRange,
      budget: this.budgetRange
    };

    this.searchTours();
  }

  removeFilter(type: string, label: string) {
    switch (type) {
      case 'duration':
        this.durationRange = [...this.defaultDurationRange];
        break;
      case 'budget':
        this.budgetRange = [...this.defaultBudgetRange];
        break;
    }
    this.applyFilters();
  }

  searchTours() {
    // Build query parameters object like header component does
    const queryParams: any = {};

    // Add destination or location ID (same logic as header)
    // if (this.selectedLocation && typeof this.selectedLocation === 'object' && this.selectedLocation.id) {
    //   queryParams.location = this.selectedLocation.id;
    // } 
    if (this.selectedDestination && this.selectedDestination.id) {
      queryParams.destination = this.selectedDestination.id;
    }

    // Add other filters
    if (this.selectedCategory) {
      queryParams.category = this.selectedCategory;
    }

    // Add budget range if different from default
    if (this.budgetRange[0] !== this.defaultBudgetRange[0] ||
      this.budgetRange[1] !== this.defaultBudgetRange[1]) {
      queryParams.min_price = this.budgetRange[0];
      queryParams.max_price = this.budgetRange[1];
    }

    // Add duration range if different from default
    if (this.durationRange[0] !== this.defaultDurationRange[0] ||
      this.durationRange[1] !== this.defaultDurationRange[1]) {
      queryParams.min_duration = this.durationRange[0];
      queryParams.max_duration = this.durationRange[1];
    }

    // Add date if selected
    if (this.selectedDate) {
      queryParams.available_from = this.selectedDate.toISOString().split('T')[0];
      queryParams.available_to = this.selectedDate.toISOString().split('T')[0];
    }

    // Navigate with query parameters (same way as header component)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });

    // Also emit the payload for backward compatibility  
    // const locationId = (this.selectedLocation && typeof this.selectedLocation === 'object') 
    //   ? this.selectedLocation.id 
    //   : '';

    const payload = {
      destination_id: this.selectedDestination?.id || '',
      category: this.selectedCategory || '',
      min_price: this.budgetRange[0],
      max_price: this.budgetRange[1],
      min_duration: this.durationRange[0],
      max_duration: this.durationRange[1],
      available_from: this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : '',
      available_to: this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : '',
      // location: locationId
    };
    this.stateSvc.setFilter({
      durationRange: this.durationRange,
      budgetRange: this.budgetRange,
      selectedDate: this.selectedDate,
      selectedCategory: this.selectedCategory,
      selectedDestination: this.selectedDestination,
      // selectedLocation: this.selectedLocation
    });
    this.searchTriggered.emit(payload);
  }

  onDestinationChange() {
    // console.log('DEBUG - onDestinationChange called');
    // console.log('DEBUG - selectedDestination after change:', this.selectedDestination);
    // this.selectedLocation = null;
    // console.log('DEBUG - selectedLocation reset to null');
    // this.searchTours();
  }

  onCategoryChange() {
    // this.searchTours();
  }

  closeAllDropdowns() {
    this.dateOpen = false;
    this.dropdownOpen = false;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getFormattedDateDisplay(): string {
    if (!this.selectedDate) return 'Select Date';
    return this.formatDate(this.selectedDate);
  }

  trackByDate(index: number, date: Date | null): string {
    return date ? date.toISOString() : `empty-${index}`;
  }

  trackByMonth(index: number, month: Date): string {
    return this.getMonthKey(month);
  }

  clearAllFilters() {
    this.durationRange = [...this.defaultDurationRange];
    this.budgetRange = [...this.defaultBudgetRange];
    this.selectedCategory = null;
    this.selectedDestination = null;
    // this.selectedLocation = null;
    this.selectedDate = null;
    this.fromCity = 'Kolkata';
    this.filterChips = [];
    this.displayedFilters = null;

    // Clear URL query parameters and trigger search
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });

    this.searchTours();
  }

  private toYYMMDD(dateISO: string) {
  // dateISO is 'YYYY-MM-DD' coming from <input type="date">
  if (!dateISO) return '';
  const [y, m, d] = dateISO.split('-');
  return `${y.slice(2)}${m.padStart(2,'0')}${d.padStart(2,'0')}`; // YYMMDD
}

private normalizeIata(s: string) {
  // Use the picked IATA if available; otherwise 3-char manual entry
  const t = (s || '').trim().toUpperCase();
  return t.length === 3 ? t : '';
}

private mapCabin(c: 'ECONOMY'|'PREMIUM_ECONOMY'|'BUSINESS'|'FIRST'): string {
  switch (c) {
    case 'PREMIUM_ECONOMY': return 'premiumeconomy';
    case 'BUSINESS':        return 'business';
    case 'FIRST':           return 'first';
    default:                return 'economy';
  }
}

/** Open Skyscanner with pre-filled search (no API required) */
redirectToSkyscanner() {
  const from = this.fromIATA || this.normalizeIata(this.fromAirportText);
  const to   = this.toIATA   || this.normalizeIata(this.toAirportText);
  if (!from || !to || !this.departDate) {
    // optionally show a toast: "Please select valid airports and a date"
    return;
  }

  const depart = this.toYYMMDD(this.departDate);
  const ret    = this.returnDate ? this.toYYMMDD(this.returnDate) : '';

  const domain = 'https://www.skyscanner.co.in';
  const path = ret ? `/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${depart}/${ret}/`
                   : `/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${depart}/`;

  const params = new URLSearchParams({
    adults: String(this.adults || 1),          // required
    // children / infants are optional; only include if > 0
    ...(this.children > 0 ? { children: String(this.children) } : {}),
    ...(this.infants  > 0 ? { infants:  String(this.infants) }  : {}),
    cabinclass: this.mapCabin(this.cabin),
    preferdirects: String(!!this.nonStop),
    currency: 'INR',
    market: 'IN',
    locale: 'en-GB',
  });

  const url = `${domain}${path}?${params.toString()}`;
  window.open(url, '_blank'); // or window.location.href = url;
}

}
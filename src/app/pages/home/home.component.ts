import { Component, AfterViewInit, inject } from '@angular/core';
import { HeaderComponent } from '../../common/header/header.component';
import { AnimationDirective } from '../../directives/animation.directive';

import { TestimonialsComponent } from "../../components/testimonials/testimonials.component";
import { DestinationsComponent } from "../../components/destinations/destinations.component";

import { ServicesComponent } from '../../components/services/services.component';
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";
import { FooterComponent } from "../../common/footer/footer.component";

import { NewsletterComponent } from "../../components/newsletter/newsletter.component";

import { MapComponent } from "../../components/map/map.component";
import { WhyUsComponent } from "../../components/why-us/why-us.component";
import { Tour } from '../../models/tour.model';
import { debounceTime, Subject } from 'rxjs';
import { TourService } from '../../services/tours/tour.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanoViewerComponent } from "../../components/pano-viewer/pano-viewer.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TourFilterComponent } from '../../common/tour-filter/tour-filter.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TripPlannerComponent } from '../../common/trip-planner/trip-planner.component';
import { TripPlannerService } from '../../services/TripPlanner/trip-planner.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, AnimationDirective, TestimonialsComponent, DestinationsComponent, ServicesComponent, ChatWidgetComponent, FooterComponent, MapComponent, WhyUsComponent,TourFilterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
    searchTerm: string = '';
  searchResults: Tour[] = [];
  searching = false;
iframeLoaded = false;
kuulaUrl!: SafeResourceUrl;
  loading = false;
  error: string | null = null;
   private searchSubject = new Subject<string>();
     private dialog = inject(MatDialog);

     constructor(private tourService: TourService,private sanitizer: DomSanitizer,
      private router: Router,private planner: TripPlannerService
     ) {
      this.kuulaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://kuula.co/share/5D6pm?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.39&thumbs=1&margin=1&inst=0'
  );
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.performSearch(term);
    });
  }
 openTripPlanner() {
    this.dialog.open(TripPlannerComponent, {
      width: '300px',
      panelClass: 'trip-modal-panel',
   disableClose: false ,
      backdropClass: 'blur-backdrop'
    });
  }
onIframeLoad() {
  this.iframeLoaded = true;
}

onIframeError() {
  this.iframeLoaded = false;
}
  onSearch() {
    this.searching = true;
    this.searchSubject.next(this.searchTerm);
  }

  performSearch(query: string) {
    if (!query || query.trim().length < 2) {
      this.searchResults = [];
      this.searching = false;
      return;
    }

    this.tourService.getFilteredTours(query).subscribe({
      next: (tours) => {
        this.searchResults = tours;
        this.searching = false;
      },
      error: () => {
        this.searchResults = [];
        this.searching = false;
      }
    }); 
  }
  ngOnInit() {
    // setTimeout(() => this.planner.openModal(), 10000);
    // setTimeout(() => this.openTripPlanner(), 50000);
   
  }
  ngAfterViewInit() {
     
    // Any additional initialization if needed
  }
handleSearch(filters: any) {
  // Convert filter values into URL-friendly queryParams
  const queryParams: any = {};

  if (filters.fromCity) queryParams.fromCity = filters.fromCity;
  if (filters.destination) queryParams.destination = filters.destination;
  if (filters.location) queryParams.location = filters.location;
  if (filters.category) queryParams.category = filters.category;
  if (filters.departureDate) queryParams.departure = new Date(filters.departureDate).toISOString();
  if (filters.totalAdults) queryParams.adults = filters.totalAdults;
  if (filters.totalChildren) queryParams.children = filters.totalChildren;
  if (filters.rooms) queryParams.rooms = filters.rooms;
  if (filters.duration) {
    queryParams.min_duration = filters.duration[0];
    queryParams.max_duration = filters.duration[1];
  }
  if (filters.budget) {
    queryParams.min_price = filters.budget[0];
    queryParams.max_price = filters.budget[1];
  }
  if (filters.hotelCategories?.length) {
    queryParams.hotels = filters.hotelCategories.join(',');
  }
  if (filters.flights) queryParams.flights = filters.flights;

  // Navigate to /tours with queryParams
  this.router.navigate(['/tours'], { queryParams });
}

}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Tour } from '../../models/tour.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TourService } from '../../services/tours/tour.service';
import { FooterComponent } from '../../common/footer/footer.component';
import { FAQComponent } from "../../components/faq/faq.component";
import { TestimonialsComponent } from "../../components/testimonials/testimonials.component";
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";
import { DestinationService } from '../../services/destination/destination.service';
import { TourFilterComponent } from '../../common/tour-filter/tour-filter.component';

@Component({
  selector: 'app-tour-package',
  standalone: true,
  imports: [
    TourFilterComponent,
    CommonModule,
    RouterModule,
    FooterComponent,
    FAQComponent,
    TestimonialsComponent,
    NavbarComponent,
    ChatWidgetComponent
  ],
  templateUrl: './tour-package.component.html',
  styleUrl: './tour-package.component.scss'
})
export class TourPackageComponent implements OnInit {
  tours: Tour[] = [];
  destinations: any[] = [];
  categories: string[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toursSvc: TourService,
    private destSvc: DestinationService
  ) {}

  ngOnInit(): void {
    // Fetch destination and category data for filter dropdowns
    this.destSvc.getNamesAndLocations().subscribe({
      next: (data) => {
        this.destinations = data;
      },
      error: err => console.error('Failed loading destinations', err)
    });

    this.toursSvc.getCategories().subscribe({
      next: (data: string[]) => {
        this.categories = data;
      },
      error: err => console.error('Failed loading categories', err)
    });

    // Handle query params for pre-applied filters
    this.route.queryParams.subscribe(params => {
      const filters = {
        destination_id: params['destination'] || '',
        location: params['location'] || '',
        category: params['category'] || '',
        fromCity: params['fromCity'] || '',
        min_price: params['min_price'] ? +params['min_price'] : '',
        max_price: params['max_price'] ? +params['max_price'] : '',
        min_duration: params['min_duration'] ? +params['min_duration'] : '',
        max_duration: params['max_duration'] ? +params['max_duration'] : '',
        available_from: params['available_from'] || '',
        available_to: params['available_to'] || ''
      };
      this.handleSearch(filters);
    });
  }

  handleSearch(filters: any) {
    this.loading = true;
    this.error = null;
console.log('Applying filters:', filters);
    // Update URL query parameters to reflect current filters
    const queryParams = {
      destination: filters.destination_id || null,
      location: filters.location || null,
      category: filters.category || null,
      fromCity: filters.fromCity || null,
      min_price: filters.min_price || null,
      max_price: filters.max_price || null,
      min_duration: filters.min_duration || null,
      max_duration: filters.max_duration || null,
      available_from: filters.available_from || null,
      available_to: filters.available_to || null
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    this.toursSvc.getFilteredTours(filters).subscribe({
      next: (data) => {
        this.tours = data;
        this.loading = false;
        if (this.tours.length === 0) {
          this.error = 'No tours found matching your filters.';
        }
      },
      error: (err) => {
        this.error = 'Failed to load tours.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  goToTourDetail(slug: string): void {
    this.router.navigate(['/tour', slug]);
  }
}
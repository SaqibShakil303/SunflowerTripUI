import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Tour } from '../../models/tour.model';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { TourService } from '../../services/tours/tour.service';
import { FooterComponent } from '../../common/footer/footer.component';
import { FAQComponent } from '../../components/faq/faq.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { ChatWidgetComponent } from '../../components/chat-widget/chat-widget.component';
import { DestinationService } from '../../services/destination/destination.service';
import { TourFilterComponent } from '../../common/tour-filter/tour-filter.component';
import { StatePersistenceService } from '../../services/state-persistence/state-persistence.service';

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
    // ChatWidgetComponent
  ],
  templateUrl: './tour-package.component.html',
  styleUrl: './tour-package.component.scss',
})
export class TourPackageComponent implements OnInit {
  @ViewChildren('tourCard') cards!: QueryList<ElementRef>;
  tours: Tour[] = [];
  destinations: any[] = [];
  categories: string[] = [];
  loading = false;
  error: string | null = null;
  previousParams: any = null;
  private lastScrollY = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toursSvc: TourService,
    private destSvc: DestinationService,
    private stateSvc: StatePersistenceService
  ) {}

  ngOnInit(): void {
    // Fetch destination and category data for filter dropdowns
    this.destSvc.getNamesAndLocations().subscribe({
      next: (data) => {
        this.destinations = data;
      },
      error: (err) => console.error('Failed loading destinations', err),
    });

    this.toursSvc.getCategories().subscribe({
      next: (data: string[]) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed loading categories', err),
    });

    // todo: probably causing serarch filter bug
    // Handle query params for pre-applied filters
    this.route.queryParams.subscribe((params) => {
      if (JSON.stringify(params) === JSON.stringify(this.previousParams)) {
        return; // prevent loop
      }

      this.previousParams = params;
      const filters = this.mapParamsToFilters(params);
      this.handleSearch(filters, false); // ⬅️ don't update URL here
    });
  }

  ngAfterViewInit() {
    // apply animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.isIntersecting ? entry.target.classList.add('visible') : null;
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.appear-from-bottom').forEach((el) => {
      observer.observe(el);
    });
    document.querySelectorAll('.appear-from-left').forEach((el) => {
      observer.observe(el);
    });
    document.querySelectorAll('.appear-from-right').forEach((el) => {
      observer.observe(el);
    });

    this.cards.changes.subscribe(() => {
      this.cards.forEach((card) => observer.observe(card.nativeElement));
    });

    // initial render
    this.cards.forEach((card) => observer.observe(card.nativeElement));
  }

  mapParamsToFilters(params: any) {
    return {
      destination_id: params['destination'] || '',
      category: params['category'] || '',
      min_price: params['min_price'] ? +params['min_price'] : '',
      max_price: params['max_price'] ? +params['max_price'] : '',
      min_duration: params['min_duration'] ? +params['min_duration'] : '',
      max_duration: params['max_duration'] ? +params['max_duration'] : '',
      available_to: params['available_to'] || '',
    };
  }

  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-IN');
  }

  handleSearch(filters: any, updateUrl = true) {
    // ✅ capture scroll BEFORE anything changes
    // this.lastScrollY = window.scrollY;
    this.loading = true;
    this.error = null;
    // console.log('Applying filters:', filters);
    // Update URL query parameters to reflect current filters
    if (updateUrl) {
      const queryParams = {
        destination: filters.destination_id || null,
        // location: filters.location || null,
        category: filters.category || null,
        // fromCity: filters.fromCity || null,
        min_price: filters.min_price || null,
        max_price: filters.max_price || null,
        min_duration: filters.min_duration || null,
        max_duration: filters.max_duration || null,
        // available_from: filters.available_from || null,
        available_to: filters.available_to || null,
      };

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }

    this.toursSvc.getFilteredTours(filters).subscribe({
      next: (data) => {
        console.log(data);
        this.tours = data;
        this.loading = false;
        if (this.tours.length === 0) {
          this.error = 'No tours found matching your filters.';
        }
        // ✅ RESTORE SCROLL AFTER DOM IS PAINTED
        // requestAnimationFrame(() => {
        //   window.scrollTo({
        //     top: this.lastScrollY,
        //     behavior: 'smooth',
        //   });
        // });
      },
      error: (err) => {
        this.error = 'Failed to load tours.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  goToTourDetail(slug: string): void {
    this.router.navigate(['/tour', slug]);
  }

  trackByTour(index: number, tour: Tour) {
    return tour.id; // or slug
  }
}

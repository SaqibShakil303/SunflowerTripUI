import { Component, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatWidgetComponent } from '../../components/chat-widget/chat-widget.component';
import { Observable } from 'rxjs';
import { Destination } from '../../models/destination.model';
import { DestinationService } from '../../services/destination/destination.service';
import { Router, RouterLink } from '@angular/router';
import { Faq, FaqService } from '../../services/faq/faq.service';

@Component({
  selector: 'app-travel-guide',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './travel-guide.component.html',
  styleUrl: './travel-guide.component.scss',
})
export class TravelGuideComponent implements OnInit {
  featuredDestinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  displayedDestinations: Destination[] = [];
  faqs = signal<Faq[]>([]);
  travelTips = [
    {
      id: 1,
      title: 'How to Pack Light for 2-Week Trips',
      summary:
        'Learn the art of efficient packing with these pro tips that will save space and stress...',
      image:
        'https://images.pexels.com/photos/1057637/pexels-photo-1057637.jpeg?auto=compress&cs=tinysrgb&w=500',
      date: 'May 5, 2025',
      readTime: '5 min read',
      url: '/travel-tips/packing-light',
    },
    {
      id: 2,
      title: 'Visa-free Countries for Indian Travelers',
      summary:
        'Discover beautiful destinations where Indian passport holders can travel without visa hassles...',
      image:
        'https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg?auto=compress&cs=tinysrgb&w=500',
      date: 'April 28, 2025',
      readTime: '7 min read',
      url: '/travel-tips/visa-free-countries',
    },
    {
      id: 3,
      title: 'Budget Travel Guide for Southeast Asia',
      summary:
        'Explore the beauty of Southeast Asia without breaking the bank with these practical tips...',
      image:
        'https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=500',
      date: 'April 15, 2025',
      readTime: '8 min read',
      url: '/travel-tips/budget-southeast-asia',
    },
    {
      id: 4,
      title: 'Travel Photography Tips for Beginners',
      summary:
        'Capture stunning vacation memories with these simple photography techniques...',
      image:
        'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=500',
      date: 'April 8, 2025',
      readTime: '6 min read',
      url: '/travel-tips/photography-basics',
    },
  ];

  popularTags = [
    'Beach Vacations',
    'Adventure Travel',
    'Family Trips',
    'Luxury Retreats',
    'Budget Travel',
    'Honeymoon',
    'Group Tours',
    'Cultural Experiences',
    'Wildlife Safari',
    'Road Trips',
  ];

  searchQuery: string = '';
  emailSubscribe: string = '';
  loading: boolean = true;
  initialDestinations: number = 6;
  incrementDestinations: number = 3;
  currentPage: number = 1;

  constructor(
    private destinationService: DestinationService,
    private faqService: FaqService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadFaqs();
  }

  loadDestinations(): void {
    this.loading = true;
    this.destinationService.getDestinations().subscribe({
      next: (destinations: Destination[]) => {
        this.featuredDestinations = destinations;
        this.filteredDestinations = destinations;
        this.updateDisplayedDestinations();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching destinations:', error);
        alert('Failed to load destinations. Please try again later.');
        this.loading = false;
      },
    });
  }

  loadFaqs(): void {
    this.faqService.getAllFaqs().subscribe({
      next: (data: any) => {
        const newFaqs = data.data.map((faq: Faq) => {
          return { ...faq, isOpen: false };
        });
        this.faqs.set(newFaqs);
      },
      error: (err) => console.error('failed to fetch all faqs:: ', err),
    });
  }

  updateDisplayedDestinations(): void {
    const endIndex =
      this.initialDestinations +
      (this.currentPage - 1) * this.incrementDestinations;
    this.displayedDestinations = this.filteredDestinations.slice(0, endIndex);
  }

  searchDestinations(): void {
    this.performSearch();
  }

  onSearchInput(): void {
    // Optional: Add debounce for real-time search
    // For now, just perform search on input
    this.performSearch();
  }

  private performSearch(): void {
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredDestinations = this.featuredDestinations.filter(
        (destination: Destination) => {
          return (
            destination.title.toLowerCase().includes(query) ||
            destination.description?.toLowerCase().includes(query) ||
            destination.best_time_to_visit?.toLowerCase().includes(query) ||
            destination.weather?.toLowerCase().includes(query)
          );
        }
      );
    } else {
      this.filteredDestinations = [...this.featuredDestinations]; // Create a copy
    }
    this.currentPage = 1; // Reset pagination
    this.updateDisplayedDestinations();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredDestinations = [...this.featuredDestinations];
    this.currentPage = 1;
    this.updateDisplayedDestinations();
  }

  getSearchResultsText(): string {
    const resultsCount = this.filteredDestinations.length;
    if (resultsCount === 0) {
      return `No results found for "${this.searchQuery}"`;
    } else if (resultsCount === 1) {
      return `Found 1 destination matching "${this.searchQuery}"`;
    } else {
      return `Found ${resultsCount} destinations matching "${this.searchQuery}"`;
    }
  }

  showMoreDestinations(): void {
    this.currentPage++;
    this.updateDisplayedDestinations();
  }

  toggleFaq(faq: any): void {
    this.faqs().forEach((item: Faq) => {
      if (item !== faq) {
        item.isOpen = false;
      }
    });
    faq.isOpen = !faq.isOpen;
  }

  subscribeNewsletter(): void {
    if (this.validateEmail(this.emailSubscribe)) {
      console.log('Subscribing email:', this.emailSubscribe);
      this.emailSubscribe = '';
      alert('Thank you for subscribing to our newsletter!');
    } else {
      alert('Please enter a valid email address.');
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  exploreDestination(destination: any): void {
    this.router.navigate(['destination', destination.title]);
  }

  readArticle(article: any): void {
    console.log('Reading article:', article.title);
    // Navigate to the article detail page
  }

  searchByTag(tag: string): void {
    this.searchQuery = tag;
    this.performSearch();
  }
}

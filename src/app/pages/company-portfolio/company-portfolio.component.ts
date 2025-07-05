import { CommonModule } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-company-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-portfolio.component.html',
  styleUrl: './company-portfolio.component.scss'
})
export class CompanyPortfolioComponent {
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  // Path to your PDF in assets folder
  pdfSrc = 'assets/travel-portfolio-sunflower-trip.pdf';
  safePdfSrc!: SafeResourceUrl;

  // Toggle PDF viewer
  isPdfVisible = false;

  // Featured destinations data
  featuredDestinations = [
    {
      name: 'Santorini, Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
      description: 'Witness breathtaking sunsets over azure waters',
      price: 'From $1,299'
    },
    {
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      description: 'Tropical paradise with ancient temples',
      price: 'From $899'
    },
    {
      name: 'Swiss Alps',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      description: 'Adventure awaits in pristine mountain landscapes',
      price: 'From $1,599'
    },
    {
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      description: 'Experience the perfect blend of tradition and modernity',
      price: 'From $1,199'
    }
  ];

  // Travel services
  services = [
    {
      icon: 'flight_takeoff',
      title: 'Flight Booking',
      description: 'Best deals on international and domestic flights'
    },
    {
      icon: 'hotel',
      title: 'Luxury Hotels',
      description: 'Handpicked accommodations for unforgettable stays'
    },
    {
      icon: 'directions_car',
      title: 'Ground Transport',
      description: 'Comfortable and reliable transportation services'
    },
    {
      icon: 'tour',
      title: 'Guided Tours',
      description: 'Expert local guides for authentic experiences'
    }
  ];

  // Statistics
  stats = [
    { number: '10,000+', label: 'Happy Travelers' },
    { number: '150+', label: 'Destinations' },
    { number: '25+', label: 'Countries' },
    { number: '5★', label: 'Average Rating' }
  ];

  ngOnInit() {
    this.safePdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
    // Trigger download only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.triggerPdfDownload();
    }
  }

  // Method to trigger automatic PDF download
  private triggerPdfDownload() {
    const link = document.createElement('a');
    link.href = this.pdfSrc;
    link.download = 'travel-portfolio-sunflower-trip.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  viewPortfolio() {
    this.isPdfVisible = true;
  }

  closeViewer() {
    this.isPdfVisible = false;
  }

  // Helper method to get service icons
  getServiceIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'flight_takeoff': '✈️',
      'hotel': '🏨',
      'directions_car': '🚗',
      'tour': '🗺️'
    };
    return iconMap[iconName] || '🔧';
  }
}
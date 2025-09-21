import { Component, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { DestinationService } from '../../services/destination/destination.service';

interface NavItem {
  name: string;
  route: string;
  queryParams?: {
    destination?: number;
    location?: number;
    category?: string;
  };
}

interface Destination {
  image_url?: string;
  name: string;
  route: string;
  queryParams?: { destination: number };
  locations: NavItem[];
}

interface DestinationGroup {
  label: string;
  destinations: Destination[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterModule, NavbarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  expandedContinent: Destination | null = null;
  selectedContinent: Destination | null = null;
  destinationGroup: DestinationGroup = {
    label: 'Destinations',
    destinations: []
  };
  isLoading = true; // Track loading state

  // Fallback data for continents and countries
  private fallbackDestinations: DestinationGroup = {
    label: 'Destinations',
    destinations: [
      {
        name: 'Europe & Britain',
        route: '/destination/Europe & Britain',
        locations: [
          { name: 'France', route: '/destination/France' },
          { name: 'Italy', route: '/destination/Italy' },
          { name: 'United Kingdom', route: '/destination/United Kingdom' },
          { name: 'Germany', route: '/destination/Germany' }
        ]
      },
      {
        name: 'North America',
        route: '/destination/North America',
        locations: [
          { name: 'United States', route: '/destination/United States' },
          { name: 'Canada', route: '/destination/Canada' },
          { name: 'Mexico', route: '/destination/Mexico' }
        ]
      },
      {
        name: 'South America',
        route: '/destination/South America',
        locations: [
          { name: 'Brazil', route: '/destination/Brazil' },
          { name: 'Argentina', route: '/destination/Argentina' },
          { name: 'Peru', route: '/destination/Peru' }
        ]
      },
      {
        name: 'Africa',
        route: '/destination/Africa',
        locations: [
          { name: 'South Africa', route: '/destination/South Africa' },
          { name: 'Kenya', route: '/destination/Kenya' },
          { name: 'Egypt', route: '/destination/Egypt' }
        ]
      },
      {
        name: 'Asia',
        route: '/destination/Asia',
        locations: [
          // { name: 'India', route: '/destination/India' },
          { name: 'Japan', route: '/destination/Japan' },
          { name: 'Thailand', route: '/destination/Thailand' }
        ]
      },
      {
        name: 'Australia & New Zealand',
        route: '/destination/Australia & New Zealand',
        locations: [
          { name: 'Australia', route: '/destination/Australia' },
          { name: 'New Zealand', route: '/destination/New Zealand' }
        ]
      }
    ]
  };

  constructor(
    private elementRef: ElementRef,
    private destSvc: DestinationService,
    private router: Router
  ) {
    // Initialize with fallback data
    this.destinationGroup = this.fallbackDestinations;
    if (this.fallbackDestinations.destinations.length > 0) {
      this.selectedContinent = this.fallbackDestinations.destinations[0];
    }

    // Fetch actual data
    this.destSvc.getDestinationNames().subscribe({
      next: (destinations) => {
        const continents = destinations.filter(d => d.parent_id === null);
        const countries = destinations.filter(d => d.parent_id !== null);
        console.log('Continents:', continents);
        console.log('Countries:', countries);

        const continentImages: { [key: string]: string } = {
          'Europe & Britain': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3',
          'North America': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62dffe?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3',
          'South America': 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3',
          'Africa': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3',
          'Asia': 'https://images.unsplash.com/photo-1528164344705-7dc57c5566d4?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3',
          'Australia & New Zealand': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
        };

        this.destinationGroup = {
          label: 'Destinations',
          destinations: continents.map(continent => ({
            name: continent.title,
            route: `/destination/${continent.title}`,
            image_url: continent.image_url || continentImages[continent.title] || '',
            queryParams: { destination: continent.id },
            locations: countries
              .filter(country => country.parent_id === continent.id)
              .map(country => ({
                name: country.title,
                route: `/destination/${country.title}`,
                queryParams: { destination: country.id }
              }))
          }))
        };

        if (this.destinationGroup.destinations.length > 0) {
          this.selectedContinent = this.destinationGroup.destinations[0];
        }
        this.isLoading = false; // Data loaded
      },
      error: err => {
        console.error('Failed to load destinations', err);
        this.isLoading = false; // Stop loading even on error, keep fallback
      }
    });
  }

  toggleContinent(destination: Destination) {
    this.expandedContinent = this.expandedContinent === destination ? null : destination;
  }

  openDropdown() {
    this.isDropdownOpen = true;
  }

  toggleDropdown(event: Event) {
    const target = event.target as HTMLElement;
    if (target.closest('.dropdown-label')) {
      this.isDropdownOpen = !this.isDropdownOpen;
      event.stopPropagation();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
    }
  }

  selectContinent(destination: Destination) {
    this.selectedContinent = destination;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.expandedContinent = null;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = this.elementRef.nativeElement.querySelector('.dropdown-nav');
    const mobileMenu = this.elementRef.nativeElement.querySelector('.mobile-menu');

    if (this.isDropdownOpen && dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen = false;
    }

    if (this.isMobileMenuOpen && mobileMenu && !mobileMenu.contains(target) && !target.closest('.mobile-menu-toggle')) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth > 768) {
      this.isMobileMenuOpen = false;
    }
  }
}
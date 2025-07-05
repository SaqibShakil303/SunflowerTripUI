import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddTourComponent } from './add-tour/add-tour.component';
import { EditTourComponent } from './edit-tour/edit-tour.component';

// Tour interface
interface Tour {
  id: number;
  destinationId: number;
  destinationName: string;
  title: string;
  slug: string;
  description: string;
  itinerary: string;
  duration: number;
  price: number;
  image: string | File | null;
  category: string;
  from: string;
  to: string;
  departureAirport: string;
  arrivalAirport: string;
  maxGroupSize: number;
  minGroupSize: number;
  inclusions: string[];
  exclusions: string[];
  complimentaries: string[];
  highlights: string[];
  bookingTerms: string;
  cancellationPolicy: string;
  metaTitle: string;
  metaDescription: string;
  pricePerPerson: number;
  currency: string;
  earlyBirdDiscount: number;
  groupDiscount: number;
  difficultyLevel: string;
  physicalRequirements: string;
  bestTimeToVisit: string;
  weatherInfo: string;
  packingList: string[];
  languagesSupported: string[];
  guidesIncluded: boolean;
  transportationIncluded: boolean;
  transportationDetails: string;
  mealsIncluded: string[];
  dietaryRestrictionsSupported: boolean;
  accommodationType: string;
  accommodationRating: string;
  activityTypes: string[];
  interests: string[];
  instantBooking: boolean;
  requiresApproval: boolean;
  advanceBookingDays: number;
  isActive: boolean;
  isFeatured: boolean;
  adults: boolean;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfRooms: number;
  isCustomizable: boolean;
  showDetails?: boolean;
  isDeleting?: boolean;
}

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './tours.component.html',
  styleUrl: './tours.component.scss'
})
export class ToursComponent implements OnInit {
  // Search and filtering
  searchTerm: string = '';

  // Sorting
  sortBy: string = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  // Data arrays
  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  paginatedTours: Tour[] = [];

  // Modal state
  showDeleteModal: boolean = false;
  tourToDelete: Tour | null = null;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadTours();
    this.applyFiltersAndSort();
  }

  // Load sample tours data
  private loadTours(): void {
    this.tours = [
      {
        id: 1,
        destinationId: 1,
        destinationName: 'Paris',
        title: 'Romantic Paris Getaway',
        slug: 'romantic-paris-getaway',
        description: 'Experience the magic of Paris with this romantic 5-day tour covering all major attractions including the Eiffel Tower, Louvre Museum, and charming Montmartre district.',
        itinerary: 'Day 1: Arrival and Eiffel Tower\nDay 2: Louvre Museum and Seine River Cruise\nDay 3: Montmartre and Sacré-Cœur\nDay 4: Versailles Palace Day Trip\nDay 5: Shopping and Departure',
        duration: 5,
        price: 1500,
        image: 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=300&h=200&fit=crop',
        category: 'Cultural',
        from: 'New York',
        to: 'Paris',
        departureAirport: 'JFK',
        arrivalAirport: 'CDG',
        maxGroupSize: 20,
        minGroupSize: 2,
        inclusions: ['Hotel Accommodation', 'Airport Transfers', 'Guided Tours', 'Breakfast'],
        exclusions: ['Lunch', 'Dinner', 'Personal Expenses', 'Tips'],
        complimentaries: ['Welcome Drink', 'City Map', 'Travel Insurance'],
        highlights: ['Eiffel Tower Visit', 'Louvre Museum', 'Seine River Cruise', 'Versailles Palace'],
        bookingTerms: '50% advance payment required. Final payment due 30 days before departure.',
        cancellationPolicy: 'Free cancellation up to 45 days before departure. 50% refund up to 30 days.',
        metaTitle: 'Romantic Paris Getaway - 5 Days Tour Package',
        metaDescription: 'Discover the romance of Paris with our 5-day tour package including Eiffel Tower, Louvre Museum, and more.',
        pricePerPerson: 1500,
        currency: 'USD',
        earlyBirdDiscount: 15,
        groupDiscount: 10,
        difficultyLevel: 'Easy',
        physicalRequirements: 'Moderate walking required',
        bestTimeToVisit: 'April to October',
        weatherInfo: 'Mild temperatures, occasional rain',
        packingList: ['Comfortable walking shoes', 'Light jacket', 'Umbrella', 'Camera'],
        languagesSupported: ['English', 'French'],
        guidesIncluded: true,
        transportationIncluded: true,
        transportationDetails: 'Private coach for all transfers and sightseeing',
        mealsIncluded: ['Breakfast'],
        dietaryRestrictionsSupported: true,
        accommodationType: 'Hotel',
        accommodationRating: '4 Stars',
        activityTypes: ['Sightseeing', 'Cultural Tours', 'Museums'],
        interests: ['History', 'Art', 'Architecture'],
        instantBooking: true,
        requiresApproval: false,
        advanceBookingDays: 7,
        isActive: true,
        isFeatured: true,
        adults: true,
        numberOfAdults: 2,
        numberOfChildren: 0,
        numberOfRooms: 1,
        isCustomizable: true
      },
      {
        id: 3,
        destinationId: 3,
        destinationName: 'New York City',
        title: 'NYC City Highlights',
        slug: 'nyc-city-highlights',
        description: 'Discover the best of New York City with this comprehensive 4-day tour covering iconic landmarks, Broadway shows, and hidden gems.',
        itinerary: 'Day 1: Statue of Liberty and Ellis Island\nDay 2: Central Park and Museums\nDay 3: Broadway Show and Times Square\nDay 4: Brooklyn Bridge and One World Trade Center',
        duration: 4,
        price: 1200,
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop',
        category: 'City Tour',
        from: 'Miami',
        to: 'New York City',
        departureAirport: 'MIA',
        arrivalAirport: 'LGA',
        maxGroupSize: 25,
        minGroupSize: 1,
        inclusions: ['Hotel Accommodation', 'Metro Cards', 'Guided Tours', 'Broadway Show Tickets'],
        exclusions: ['Meals', 'Personal Expenses', 'Shopping', 'Tips'],
        complimentaries: ['City Guide Book', 'NYC Map', 'Emergency Contact Card'],
        highlights: ['Statue of Liberty', 'Central Park', 'Broadway Show', 'Brooklyn Bridge'],
        bookingTerms: '30% advance payment required. Final payment due 14 days before departure.',
        cancellationPolicy: 'Free cancellation up to 21 days before departure. 40% refund up to 7 days.',
        metaTitle: 'NYC City Highlights - 4 Days New York Tour',
        metaDescription: 'Experience the best of New York City with our 4-day highlights tour including Broadway and landmarks.',
        pricePerPerson: 1200,
        currency: 'USD',
        earlyBirdDiscount: 10,
        groupDiscount: 8,
        difficultyLevel: 'Easy',
        physicalRequirements: 'Comfortable walking in urban environment',
        bestTimeToVisit: 'April to June, September to November',
        weatherInfo: 'Four distinct seasons, can be humid in summer',
        packingList: ['Comfortable walking shoes', 'Weather-appropriate clothing', 'Portable phone charger', 'Small backpack'],
        languagesSupported: ['English', 'Spanish'],
        guidesIncluded: true,
        transportationIncluded: false,
        transportationDetails: 'Metro cards provided, walking tours',
        mealsIncluded: [],
        dietaryRestrictionsSupported: false,
        accommodationType: 'Hotel',
        accommodationRating: '3 Stars',
        activityTypes: ['Sightseeing', 'Entertainment', 'Urban Exploration'],
        interests: ['Architecture', 'Entertainment', 'History', 'Food'],
        instantBooking: true,
        requiresApproval: false,
        advanceBookingDays: 3,
        isActive: true,
        isFeatured: true,
        adults: true,
        numberOfAdults: 1,
        numberOfChildren: 0,
        numberOfRooms: 1,
        isCustomizable: false
      },
      {
        id: 4,
        destinationId: 4,
        destinationName: 'Bali',
        title: 'Bali Tropical Paradise',
        slug: 'bali-tropical-paradise',
        description: 'Escape to paradise with this 8-day Bali tour featuring beautiful beaches, ancient temples, lush rice terraces, and traditional culture.',
        itinerary: 'Day 1: Arrival in Denpasar\nDay 2: Ubud Rice Terraces and Monkey Forest\nDay 3: Temple Tour - Tanah Lot and Uluwatu\nDay 4: Volcano Sunrise Trek\nDay 5: Beach Day in Seminyak\nDay 6: Water Sports and Spa\nDay 7: Cultural Village Visit\nDay 8: Departure',
        duration: 8,
        price: 1800,
        image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop',
        category: 'Beach & Culture',
        from: 'Singapore',
        to: 'Bali',
        departureAirport: 'SIN',
        arrivalAirport: 'DPS',
        maxGroupSize: 12,
        minGroupSize: 2,
        inclusions: ['Resort Accommodation', 'Airport Transfers', 'Guided Tours', 'All Meals', 'Spa Session'],
        exclusions: ['Personal Expenses', 'Optional Activities', 'Alcohol', 'Tips'],
        complimentaries: ['Welcome Fruit Basket', 'Sarong', 'Travel Insurance'],
        highlights: ['Rice Terraces Tour', 'Temple Visits', 'Volcano Sunrise', 'Traditional Spa'],
        bookingTerms: '50% advance payment required. Balance due 30 days before departure.',
        cancellationPolicy: 'Free cancellation up to 45 days before departure. 30% refund up to 21 days.',
        metaTitle: 'Bali Tropical Paradise - 8 Days Indonesia Tour',
        metaDescription: 'Discover the beauty of Bali with our 8-day tropical paradise tour including temples, beaches, and culture.',
        pricePerPerson: 1800,
        currency: 'USD',
        earlyBirdDiscount: 18,
        groupDiscount: 15,
        difficultyLevel: 'Moderate',
        physicalRequirements: 'Moderate fitness for volcano trek and temple visits',
        bestTimeToVisit: 'April to October',
        weatherInfo: 'Tropical climate, dry season recommended',
        packingList: ['Lightweight clothing', 'Hiking boots', 'Swimwear', 'Sun protection', 'Insect repellent'],
        languagesSupported: ['English', 'Indonesian'],
        guidesIncluded: true,
        transportationIncluded: true,
        transportationDetails: 'Private air-conditioned vehicle with driver',
        mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
        dietaryRestrictionsSupported: true,
        accommodationType: 'Resort',
        accommodationRating: '5 Stars',
        activityTypes: ['Beach Activities', 'Cultural Tours', 'Adventure', 'Wellness'],
        interests: ['Nature', 'Culture', 'Relaxation', 'Adventure'],
        instantBooking: false,
        requiresApproval: true,
        advanceBookingDays: 21,
        isActive: true,
        isFeatured: true,
        adults: true,
        numberOfAdults: 2,
        numberOfChildren: 0,
        numberOfRooms: 1,
        isCustomizable: true
      },
      {
        id: 5,
        destinationId: 5,
        destinationName: 'London',
        title: 'London Royal Heritage',
        slug: 'london-royal-heritage',
        description: 'Explore the royal heritage of London with this 6-day tour covering palaces, museums, and traditional British experiences.',
        itinerary: 'Day 1: Arrival and Thames River Cruise\nDay 2: Buckingham Palace and Westminster\nDay 3: Tower of London and London Bridge\nDay 4: British Museum and Covent Garden\nDay 5: Windsor Castle Day Trip\nDay 6: Departure',
        duration: 6,
        price: 1600,
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=200&fit=crop',
        category: 'Historical',
        from: 'Boston',
        to: 'London',
        departureAirport: 'BOS',
        arrivalAirport: 'LHR',
        maxGroupSize: 18,
        minGroupSize: 2,
        inclusions: ['Hotel Accommodation', 'Oyster Card', 'Palace Tickets', 'Guided Tours', 'Afternoon Tea'],
        exclusions: ['Lunch', 'Dinner', 'Personal Shopping', 'Tips'],
        complimentaries: ['Welcome Package', 'London Guidebook', 'Umbrella'],
        highlights: ['Buckingham Palace', 'Tower of London', 'Windsor Castle', 'Traditional Afternoon Tea'],
        bookingTerms: '40% advance payment required. Final payment due 28 days before departure.',
        cancellationPolicy: 'Free cancellation up to 35 days before departure. 35% refund up to 14 days.',
        metaTitle: 'London Royal Heritage - 6 Days UK Tour',
        metaDescription: 'Discover London\'s royal heritage with our 6-day tour including palaces, museums, and British traditions.',
        pricePerPerson: 1600,
        currency: 'USD',
        earlyBirdDiscount: 12,
        groupDiscount: 9,
        difficultyLevel: 'Easy',
        physicalRequirements: 'Comfortable walking in the city',
        bestTimeToVisit: 'May to September',
        weatherInfo: 'Mild climate, frequent light rain',
        packingList: ['Waterproof jacket', 'Comfortable shoes', 'Layers for changing weather', 'Umbrella'],
        languagesSupported: ['English'],
        guidesIncluded: true,
        transportationIncluded: false,
        transportationDetails: 'Public transport passes included, walking tours',
        mealsIncluded: ['Breakfast', 'Afternoon Tea'],
        dietaryRestrictionsSupported: true,
        accommodationType: 'Hotel',
        accommodationRating: '4 Stars',
        activityTypes: ['Sightseeing', 'Historical Tours', 'Cultural Experiences'],
        interests: ['History', 'Royalty', 'Museums', 'Architecture'],
        instantBooking: true,
        requiresApproval: false,
        advanceBookingDays: 5,
        isActive: false,
        isFeatured: false,
        adults: true,
        numberOfAdults: 2,
        numberOfChildren: 0,
        numberOfRooms: 1,
        isCustomizable: true
      }
    ];
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  // Sorting functionality
  onSort(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.onSort();
  }

  // Apply filters and sorting
  private applyFiltersAndSort(): void {
    // Filter tours based on search term
    this.filteredTours = this.tours.filter(tour =>
      tour.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      tour.destinationName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      tour.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      tour.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Sort tours
    this.filteredTours.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'destination':
          aValue = a.destinationName;
          bValue = b.destinationName;
          break;
        case 'price':
          aValue = a.pricePerPerson;
          bValue = b.pricePerPerson;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue - bValue;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.updatePagination();
  }

  // Pagination functionality
  private updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTours = this.filteredTours.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTours.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredTours.length);
  }

  getSerialNumber(index: number): number {
    return this.getStartIndex() + index + 1;
  }

  // Details functionality
  toggleDetails(tour: Tour): void {
    tour.showDetails = !tour.showDetails;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTourComponent, {
      width: '800px',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add the tour
        result.id = Math.max(...this.tours.map(t => t.id)) + 1;
        this.tours.push(result);
        this.applyFiltersAndSort();
      }
    });
  }

  // Edit functionality
  openEditDialog(tour: Tour): void {
    const dialogRef = this.dialog.open(EditTourComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { ...tour } // Pass a copy of the tour data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the tour in the tours array
        const index = this.tours.findIndex(t => t.id === result.id);
        if (index !== -1) {
          this.tours[index] = result;
          this.applyFiltersAndSort();
        }
      }
    });
  }

  // Delete functionality
  deleteTour(tour: Tour): void {
    this.tourToDelete = tour;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.tourToDelete) {
      // Set deleting state
      this.tourToDelete.isDeleting = true;

      // Simulate API call delay
      setTimeout(() => {
        if (this.tourToDelete) {
          // Remove from tours array
          this.tours = this.tours.filter(t => t.id !== this.tourToDelete!.id);

          // Reapply filters and update pagination
          this.applyFiltersAndSort();

          // Adjust current page if necessary
          const totalPages = this.getTotalPages();
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
            this.updatePagination();
          }
        }

        this.cancelDelete();
      }, 1000);
    }
  }

  cancelDelete(): void {
    if (this.tourToDelete) {
      this.tourToDelete.isDeleting = false;
    }
    this.showDeleteModal = false;
    this.tourToDelete = null;
  }

  // Refresh functionality
  refreshTours(): void {
    // Simulate refreshing data
    this.loadTours();
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  // TrackBy function for ngFor performance
  trackByTourId(index: number, tour: Tour): number {
    return tour.id;
  }
}
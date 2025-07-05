import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';
import { ItineraryDay, RoomType, Tour, TourPhoto, TourReview } from '../../models/tour.model';

// export interface Tour {
//   id: number;
//   title: string;
//   slug: string;
//   location: string;
//   description: string;
//   price: number;
//   image_url: string;
// }

@Injectable({
  providedIn: 'root'
})
export class TourService {

    constructor(private http: HttpClient,
      @Inject(PLATFORM_ID) private platformId: Object
    ) { }
 
  private apiUrl = environment.apiDomain;

 getTourBySlug(slug: string): Observable<Tour> {
    return this.http
      .get<any>(`${this.apiUrl}/Tours/${slug}`)
      .pipe(
        map(raw => this.transformTourData(raw))
      );
  }

getFilteredTours(params: any): Observable<Tour[]> {
  return this.http.get<Tour[]>(`${this.apiUrl}/Tours/filters`, { params });
}

getCategories(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/Tours/categories`);
}
  getAllTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/Tours`);
  }
   getByDestination(destId: number): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/Tours/${destId}/destination`);
  }

  getByLocation(locId: number): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/Tours/${locId}/location`);
  }
  getByCategory(category: string): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/Tours/category/${category}`);
  }
    getTours(params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    duration?: number;
    destination?: string;
    featured?: boolean;
  }): Observable<{ tours: Tour[], total: number, page: number, totalPages: number }> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/tours`, { params: httpParams }).pipe(
      map(response => ({
        ...response,
        tours: response.tours.map((tour: any) => this.transformTourData(tour))
      }))
    );
  }

    // Get tour photos
  // getTourPhotos(tourId: number): Observable<TourPhoto[]> {
  //   return this.http.get<TourPhoto[]>(`${this.apiUrl}/tours/${tourId}/photos`);
  // }

  // // Get tour reviews
  // getTourReviews(tourId: number): Observable<TourReview[]> {
  //   return this.http.get<TourReview[]>(`${this.apiUrl}/tours/${tourId}/reviews`);
  // }

  // // Get room types for a tour
  // getRoomTypes(tourId: number): Observable<RoomType[]> {
  //   return this.http.get<RoomType[]>(`${this.apiUrl}/tours/${tourId}/room-types`);
  // }

  // // Get structured itinerary
  // getItinerary(tourId: number): Observable<ItineraryDay[]> {
  //   return this.http.get<ItineraryDay[]>(`${this.apiUrl}/tours/${tourId}/itinerary`);
  // }

  // Submit tour enquiry
  submitEnquiry(tourId: number, enquiryData: {
    name: string;
    email: string;
    phone: string;
    message: string;
    preferredDate?: string;
    numberOfGuests?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/tours/${tourId}/enquiry`, enquiryData);
  }

  // Submit tour booking
  submitBooking(tourId: number, bookingData: {
    customerDetails: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    travelDetails: {
      departureDate: string;
      returnDate: string;
      numberOfGuests: number;
      roomRequirements: { roomTypeId: number; quantity: number }[];
    };
    specialRequests?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/tours/${tourId}/booking`, bookingData);
  }

  // Add tour to wishlist
  addToWishlist(tourId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist`, { tourId });
  }

  // Remove from wishlist
  removeFromWishlist(tourId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${tourId}`);
  }

  // Get user's wishlist
  getUserWishlist(): Observable<Tour[]> {
    return this.http.get<any[]>(`${this.apiUrl}/wishlist`).pipe(
      map(response => response.map(item => this.transformTourData(item.tour)))
    );
  }

  // Submit review
  submitReview(tourId: number, reviewData: {
    reviewerName: string;
    reviewerEmail: string;
    rating: number;
    comment: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/tours/${tourId}/reviews`, reviewData);
  }

  // Get featured tours
  getFeaturedTours(limit: number = 6): Observable<Tour[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tours/featured?limit=${limit}`).pipe(
      map(response => response.map(tour => this.transformTourData(tour)))
    );
  }

  // Get similar tours
  getSimilarTours(tourId: number, limit: number = 4): Observable<Tour[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tours/${tourId}/similar?limit=${limit}`).pipe(
      map(response => response.map(tour => this.transformTourData(tour)))
    );
  }

  // Private method to transform API response to Tour model
  // private transformTourData(data: any): Tour {
  //   const tour = new Tour();
    
  //   // Map all fields from API response to Tour model
  //   Object.keys(data).forEach(key => {
  //     if (data[key] !== undefined) {
  //       (tour as any)[key] = data[key];
  //     }
  //   });

  //   // Parse JSON fields if they're strings
  //   if (typeof data.inclusions === 'string') {
  //     try {
  //       tour.inclusions = JSON.parse(data.inclusions);
  //     } catch (e) {
  //       tour.inclusions = [];
  //     }
  //   }

  //   if (typeof data.exclusions === 'string') {
  //     try {
  //       tour.exclusions = JSON.parse(data.exclusions);
  //     } catch (e) {
  //       tour.exclusions = [];
  //     }
  //   }

  //   if (typeof data.complementaries === 'string') {
  //     try {
  //       tour.complementaries = JSON.parse(data.complementaries);
  //     } catch (e) {
  //       tour.complementaries = [];
  //     }
  //   }

  //   if (typeof data.highlights === 'string') {
  //     try {
  //       tour.highlights = JSON.parse(data.highlights);
  //     } catch (e) {
  //       tour.highlights = [];
  //     }
  //   }

  //   if (typeof data.languages_supported === 'string') {
  //     try {
  //       tour.languages_supported = JSON.parse(data.languages_supported);
  //     } catch (e) {
  //       tour.languages_supported = [];
  //     }
  //   }

  //   if (typeof data.activity_types === 'string') {
  //     try {
  //       tour.activity_types = JSON.parse(data.activity_types);
  //     } catch (e) {
  //       tour.activity_types = [];
  //     }
  //   }

  //   if (typeof data.meals_included === 'string') {
  //     try {
  //       tour.meals_included = JSON.parse(data.meals_included);
  //     } catch (e) {
  //       tour.meals_included = [];
  //     }
  //   }

  //   if (typeof data.packing_list === 'string') {
  //     try {
  //       tour.packing_list = JSON.parse(data.packing_list);
  //     } catch (e) {
  //       tour.packing_list = [];
  //     }
  //   }

  //   // Convert price to number if it's a string
  //   if (typeof data.price === 'string') {
  //     tour.price = parseFloat(data.price);
  //   }

  //   return tour;
  // }
   private transformTourData(raw: any): Tour {
    // for each field that might be JSON-encoded:
    raw.inclusions       = this.safeParse(raw.inclusions);
    raw.exclusions       = this.safeParse(raw.exclusions);
    raw.complementaries  = this.safeParse(raw.complementaries);
    raw.highlights       = this.safeParse(raw.highlights);
    raw.languages_supported = this.safeParse(raw.languages_supported);
    raw.meals_included   = this.safeParse(raw.meals_included);
    raw.activity_types   = this.safeParse(raw.activity_types);
    // …and any others…

    return raw as Tour;
  }
 private safeParse(field: any): any[] {
    if (typeof field === 'string') {
      try { return JSON.parse(field); }
      catch { return []; }
    }
    return Array.isArray(field) ? field : [];
  }

  // Helper method to format price
  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  }
  
getFilters(): Observable<{ cities: string[]; categories: string[] }> {
  return this.http.get<{ cities: string[]; categories: string[] }>(
    `${this.apiUrl}/Tours/filters`
  );
}

  // Helper method to get availability status
  getAvailabilityStatus(availableFrom: string, availableTo: string): {
    status: 'available' | 'ending_soon' | 'not_available';
    message: string;
  } {
    const now = new Date();
    const fromDate = new Date(availableFrom);
    const toDate = new Date(availableTo);
    const daysUntilEnd = Math.ceil((toDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (now < fromDate) {
      return {
        status: 'not_available',
        message: `Available from ${fromDate.toLocaleDateString()}`
      };
    } else if (now > toDate) {
      return {
        status: 'not_available',
        message: 'No longer available'
      };
    } else if (daysUntilEnd <= 30) {
      return {
        status: 'ending_soon',
        message: `Ending in ${daysUntilEnd} days`
      };
    } else {
      return {
        status: 'available',
        message: `Available until ${toDate.toLocaleDateString()}`
      };
    }
  }

}

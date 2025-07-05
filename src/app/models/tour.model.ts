// tour.model.ts - Updated with all fields from the design

export interface TourPhoto {
  id: number;
  url: string;
  caption: string;
  is_primary: boolean;
}

export interface TourReview {
  id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  max_occupancy: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  meals_included?: string[];
  accommodation?: string;
}

export class Tour {
  // Existing fields
  id!: number;
  destination_id!: number;
  location_ids!: number[];
  title!: string;
  slug!: string;
  location!: string;
  description!: string;
  itinerary!: string | ItineraryDay[]; // Can be string or structured data
  price!: number | string;
  image_url!: string;
  duration_days!: number;
  available_from!: string;
  available_to!: string;
  category!: string;

  // New fields from the design
  departure_airport?: string;
  arrival_airport?: string;
  max_group_size?: number;
  min_group_size?: number;
  
  // Inclusions, Exclusions, Complementaries
  inclusions?: string[];
  exclusions?: string[];
  complementaries?: string[];
  
  // Highlights
  highlights?: string[];
  
  // Room types for booking
  room_types?: RoomType[];
  
  // Photo gallery
  photos?: TourPhoto[];
  
  // Reviews
  reviews?: TourReview[];
  
  // Additional booking information
  booking_terms?: string;
  cancellation_policy?: string;
  
  // SEO and metadata
  meta_title?: string;
  meta_description?: string;
  
  // Pricing details
  price_per_person?: number;
  price_currency?: string;
  early_bird_discount?: number;
  group_discount?: number;
  
  // Tour difficulty and physical requirements
  difficulty_level?: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  physical_requirements?: string;
  
  // Weather and best time to visit
  best_time_to_visit?: string;
  weather_info?: string;
  
  // What to bring / pack
  packing_list?: string[];
  
  // Languages supported
  languages_supported?: string[];
  
  // Guide information
  guide_included?: boolean;
  guide_languages?: string[];
  
  // Transportation
  transportation_included?: boolean;
  transportation_details?: string;
  
  // Meal information
  meals_included?: string[];
  dietary_restrictions_supported?: string[];
  
  // Accommodation details
  accommodation_type?: string;
  accommodation_rating?: number;
  
  // Activity level and interests
  activity_types?: string[];
  interests?: string[];
  
  // Booking and availability
  instant_booking?: boolean;
  requires_approval?: boolean;
  advance_booking_days?: number;
  
  // Status
  is_active?: boolean;
  is_featured?: boolean;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  isCustomizable?: boolean; // New: for customizable days

}
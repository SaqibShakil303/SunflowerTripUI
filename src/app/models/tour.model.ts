export interface TourPhoto {
  id: number;
  url: string;
  caption: string;
  is_primary: boolean;
  display_order?: number; // Added from JSON
}

export interface TourReview {
  id: number;
  reviewer_name: string;
  reviewer_email?: string | null; // Added from JSON
  rating: number;
  comment: string;
  date: string;
  is_verified?: boolean; // Added from JSON
  is_approved?: boolean; // Added from JSON
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
  accommodation?: string | null; // Modified to allow null as per JSON
}

export class Tour {
  // Existing fields
  id!: number;
  destination_id!: number;
  destination_title?:string;
  // location_ids!: number[];
  title!: string;
  slug!: string;
  // location?: string; // Optional as not present in JSON
  description!: string;
  itinerary!: string | ItineraryDay[]; // Can be string or structured data
  price!: string; // Changed to string to match JSON's "52999.00"
  image_url!: string;
  map_embed_url!: string ; // Modified to allow null as per JSON
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
  price_per_person?: string; // Changed to string to match JSON's "52999.00"
  price_currency?: string;
  early_bird_discount?: string; // Changed to string to match JSON's "10.00"
  group_discount?: string; // Changed to string to match JSON's "5.00"

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
  guide_included?: boolean; // Changed to boolean to match JSON's 1/0
  guide_languages?: string[];

  // Transportation
  transportation_included?: boolean; // Changed to boolean to match JSON's 1/0
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
  instant_booking?: boolean; // Changed to boolean to match JSON's 1/0
  requires_approval?: boolean; // Changed to boolean to match JSON's 1/0
  advance_booking_days?: number;

  // Status
  is_active?: boolean; // Changed to boolean to match JSON's 1/0
  is_featured?: boolean; // Changed to boolean to match JSON's 1/0

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Customizable flag
  is_customizable?: boolean; // Changed to is_customizable to match JSON

  flight_included?: boolean;

  // Booking counts
  adults?: number;
  children?: number;
  rooms?: number;

  // Additional fields for UI state management
  showDetails?: boolean;
  isDeleting?: boolean;
}
export interface TourPhoto {
  id: number;
  url: string;
  caption: string;
  is_primary: boolean;
  display_order?: number;
}

export interface TourReview {
  id: number;
  reviewer_name: string;
  reviewer_email?: string | null;
  rating: number;
  comment: string;
  date: string;
  is_verified?: boolean;
  is_approved?: boolean;
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
  accommodation?: string | null;
}

export interface TourDeparture {
  departure_date: string;
  available_seats: number;
}

export class Tour {
  id!: number;
  destination_id!: number;
  destination_titles?: string[];
  location_names?: string[];
  location_ids?: number[];
  destination_ids?: number[];
  title!: string;
  slug!: string;
  description!: string;
  itinerary!: string | ItineraryDay[];
  price!: string;
  price_per_person!: string;
  price_currency?: string;
  image_url!: string;
  map_embed_url!: string;
  duration_days!: number;
  available_from!: string;
  available_to!: string;
  category!: string;
  departure_airport?: string;
  arrival_airport?: string;
  max_group_size?: number;
  min_group_size?: number;
  inclusions?: string[];
  exclusions?: string[];
  complementaries?: string[];
  highlights?: string[];
  room_types?: RoomType[];
  photos?: TourPhoto[];
  reviews?: TourReview[];
  departures?: TourDeparture[];
  booking_terms?: string;
  cancellation_policy?: string;
  meta_title?: string;
  meta_description?: string;
  early_bird_discount?: string;
  group_discount?: string;
  difficulty_level?: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  physical_requirements?: string;
  best_time_to_visit?: string;
  weather_info?: string;
  packing_list?: string[];
  languages_supported?: string[];
  guide_included?: boolean;
  guide_languages?: string[];
  transportation_included?: boolean;
  transportation_details?: string;
  meals_included?: string[];
  dietary_restrictions_supported?: string[];
  accommodation_type?: string;
  accommodation_rating?: number;
  activity_types?: string[];
  interests?: string[];
  instant_booking?: boolean;
  requires_approval?: boolean;
  advance_booking_days?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_customizable?: boolean;
  flight_included?: boolean;
  adults?: number;
  children?: number;
  rooms?: number;
  created_at?: string;
  updated_at?: string;
  showDetails?: boolean;
  isDeleting?: boolean;
}
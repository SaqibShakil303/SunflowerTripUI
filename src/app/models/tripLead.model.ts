export interface TripLead {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  preferred_country?: string;
  preferred_city?: string;
  departure_date?: Date | string;
  return_date?: Date | string;
  number_of_days?: number;
  number_of_adults?: number;
  number_of_children?: number;
  number_of_male?: number;
  number_of_female?: number;
  number_of_other?: number;
  aged_persons: number[];
  hotel_rating?: string;
  meal_plan?: string;
  room_type?: string;
  need_flight: boolean;
  departure_airport?: string;
  trip_type?: string;
  estimate_range?: string;
  isExpanded?: boolean;
  isDeleting?: boolean;
}

export function createDefaultTripLead(): TripLead {
  return {
    id: 0,
    full_name: '',
    email: '',
    phone_number: '',
    preferred_country: '',
    preferred_city: '',
    departure_date: undefined,
    return_date: undefined,
    number_of_days: 0,
    number_of_adults: 0,
    number_of_children: 0,
    number_of_male: 0,
    number_of_female: 0,
    number_of_other: 0,
    aged_persons: [],
    hotel_rating: '',
    meal_plan: '',
    room_type: '',
    need_flight: false,
    departure_airport: '',
    trip_type: '',
    estimate_range: '',
    isExpanded: false,
    isDeleting: false
  };
}
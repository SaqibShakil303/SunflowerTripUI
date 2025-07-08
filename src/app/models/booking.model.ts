export interface Booking {
  id: number;
  tour_id: number;
  name: string;
  email: string;
  phone: string;
  days?: number;
  adults: number;
  children: number;
  child_ages?: number[];
  hotel_rating: string;
  meal_plan: string;
  flight_option?: string;
  flight_number?: string;
  travel_date: string;
  created_at?: Date;
  isExpanded?: boolean;
  isDeleting?: boolean;
}

export function createDefaultBooking(): Booking {
  return {
    id: 0,
    tour_id: 0,
    name: '',
    email: '',
    phone: '',
    days: 1,
    adults: 1,
    children: 0,
    child_ages: [],
    hotel_rating: '3',
    meal_plan: 'no-meal',
    flight_option: 'without-flight',
    flight_number: '',
    travel_date: new Date().toISOString().split('T')[0],
  };
}
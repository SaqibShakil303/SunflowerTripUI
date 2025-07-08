export interface Booking {
  id?: number;
  tour_id: number;
  name: string;
  email: string;
  phone: string;
  days?: number;
  adults: number;
  children: number;
  child_ages?: number[];
  hotel_rating: '3' | '4' | '5';
  meal_plan: 'no-meal' | 'breakfast';
  flight_option?: 'with-flight' | 'without-flight';
  flight_number?: string;
  travel_date: string;
  created_at?: string;

  // frontend-only optional props
  isExpanded?: boolean;
  isDeleting?: boolean;
}

// Optional helper for frontend display formatting
// export type BookingDisplay = Booking & {
//   isExpanded?: boolean;
//   isDeleting?: boolean;
// };

export function createDefaultBooking(): Booking {
  return {
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

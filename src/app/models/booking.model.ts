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


export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'FAILED_SEATS';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';

export interface MyBookingItem {
  booking_id: number;
  tour_id: number;
  guests: number;
  travel_date: string; // ISO
  total_amount_paise: number;
  payment_status: PaymentStatus | string;
  status: BookingStatus | string;
  created_at: string;

  tour_title: string;
  tour_image_url: string | null;
  tour_category: string | null;
  departure_date: string | null;
}

export interface BookingDetails {
  id: number;
  booking_id: number;
  tour_id: number;

  name: string | null;
  email: string | null;
  phone: string | null;

  days: number | null;
  adults: number | null;
  children: number | null;
  child_ages: string | null; // JSON string like ["5"]

  hotel_rating: string | null;
  meal_plan: string | null;

  flight_option: string | null;
  flight_number: string | null;

  travel_date: string | null;
  departure_id: number | null;

  created_at: string;
  updated_at: string;
}

export interface Traveller {
  id: number;
  booking_id: number;
  full_name: string;
  age: number | null;
  email: string | null;
  phone: string | null;
  passport_number: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BookingDetailsResponse {
  booking: {
    id: number;
    tour_id: number;
    user_id: number | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    guests: number;
    travel_date: string;
    departure_id: number | null;
    total_amount_paise: number;
    payment_status: string;
    status: string;
    created_at: string;

    tour_title: string;
    tour_image_url: string | null;
    tour_category: string | null;
    departure_date: string | null;
  };
  booking_details: BookingDetails | null;
  travellers: Traveller[];
}
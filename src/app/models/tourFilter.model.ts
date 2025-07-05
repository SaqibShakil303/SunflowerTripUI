export interface TourFilter {
  from_city?: string;
  destination_id?: number;
  departure_date?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  min_price?: number;
  max_price?: number;
  category?: string;
}

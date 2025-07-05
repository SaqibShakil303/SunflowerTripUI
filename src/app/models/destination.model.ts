export interface Location {
  id?: number;
  destination_id?: number;
  name: string;
  description: string;
  image_url: string;
  iframe_360: string;
}

export interface Attraction {
  id?: number;
  destination_id?: number;
  title: string;
  image_url: string;
  rating: number;
  video_url?: string;
}

export interface Ethnicity {
  id?: number; // Optional, as new ethnicities may not have an ID
  destination_id?: number;
  title: string;
  image_url: string;
}

export interface Cuisine {
  id?: number; // Optional, as new cuisines may not have an ID
  destination_id?: number;
  title: string;
  image_url: string;
}

export interface Activity {
  id?: number; // Optional, as new activities may not have an ID
  destination_id?: number;
  title: string;
  image_url: string;
}

export interface ItineraryBlock {
  title: string;
  description: string;
}

export interface Tour {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  description: string;
  price: number;
  duration_days: number;
}

export class Destination {
  id!: number;
  title!: string;
  slug?: string;
  description!: string;
  image_url!: string;
  best_time_to_visit!: string;
  weather!: string;
  currency!: string;
  language!: string;
  time_zone!: string;
  parent_id?: number;
  locations!: Location[];
  attractions!: Attraction[];
  ethnicities!: Ethnicity[];
  cuisines!: Cuisine[];
  activities!: Activity[];
  itinerary_blocks?: ItineraryBlock[];
  tours?: Tour[];
}
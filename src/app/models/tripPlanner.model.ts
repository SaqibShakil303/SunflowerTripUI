export class tripPlanner{
     id?: number;
  full_name!: string;
  email!: string;
  phone_number!: string;
  preferred_country?: string;
  preferred_city?: string;
  departure_date!: string;
  return_date?: string;
  number_of_days!: number;
  number_of_adults!: number;
  number_of_children?: number;
  number_of_male?: number;
  number_of_female?: number;
  number_of_other?: number;
  aged_persons?: any[];
  hotel_rating!: string;
  meal_plan!: string;
  room_type!: string;
  need_flight!: boolean;
  departure_airport?: string;
  trip_type?: string;
  estimate_range?: string;
}
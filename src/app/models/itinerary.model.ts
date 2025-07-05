export class Itinerary {
  /** Unique identifier for the itinerary */
  id?: number;
  /** User's full name */
  name!: string;
  /** User's email address */
  email!: string;
  /** User's phone number */
  phone!: string;
  /** Preferred travel destination */
  destination?: string;
  /** Total number of travelers */
  travelers!: number;
  /** Number of children in the party */
  children?: number;
  /** Ages of each child, length matches `children` */
  childAges?: number[];
  /** Trip duration in days */
  duration!: number;
  /** Tentative travel start date (ISO format) */
  date!: string;
  /** Budget range identifier (e.g., "25000-50000") */
  budget!: string;
  /** Hotel star category: 3 | 4 | 5 */
  hotelCategory!: 3 | 4 | 5;
  /** Travel type: honeymoon, family, or group */
  travelType!: 'honeymoon' | 'family' | 'group';
  /** Occupation of primary traveler */
  occupation!: 'service' | 'business' | 'others';
  /** Additional travel preferences or remarks */
  preferences?: string;
  /** Date and time when the itinerary was created (ISO format) */
  created_at?: string;
}

export class Enquiry {
  id!: number;
  tour_id!: string;
  tour_title?: string;
  name!: string;
  email!: string;
  phone?: string;
  description?: string;
  created_at!: Date;// Allow string from API, convert to Date
  isDeleting?: boolean; // Frontend-only
  isExpanded?: boolean; // Frontend-only
}

export function createDefaultEnquiry(): Enquiry {
  return {
    id: 0,
    tour_id: '',
    name: '',
    email: '',
    phone: '',
    description: '',
    created_at: new Date(),
    isDeleting: false,
    isExpanded: false
  };
}
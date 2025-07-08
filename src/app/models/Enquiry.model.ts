export interface Enquiry {
  id: number;
  tourId: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
  createdDate: Date;
  isExpanded?: boolean;
  isDeleting?: boolean;
}

export interface Job {
  id: string;
  title: string;
   department: string;
  location: string;
   type: string; // Full-time, Contract, etc.
  experience: string;
  responsibilities: string[];
  skills: string[];
    category: string; // For filtering: product, marketing, operations, customer
}
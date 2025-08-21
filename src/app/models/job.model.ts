export class JobModel {
  id?: number;
  title?: string;
  department?: string;
  location?: string;
  type?: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salary_range?: string;
  experience_required?: string;
  status?: 'Open' | 'Closed' | 'Draft';
  created_at?: string;
  updated_at?: string;
  application_deadline?: string | null;

  // Additional fields for UI state management
  showDetails?: boolean;
  isDeleting?: boolean;
}

export class ApplicationModel {
  id?: number;
  job_id: number;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status?: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Hired';
  applied_at?: string;

  constructor(
    job_id: number,
    name: string,
    email: string,
    phone?: string,
    resume_url?: string,
    cover_letter?: string,
    status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Hired' = 'Pending',
    applied_at?: string
  ) {
    this.job_id = job_id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.resume_url = resume_url;
    this.cover_letter = cover_letter;
    this.status = status;
    this.applied_at = applied_at;
  }
}
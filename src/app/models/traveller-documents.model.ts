export type DocType = 'passport' | 'visa' | 'id_proof' | 'supporting';
export type DocStatus = 'not_uploaded' | 'pending' | 'verified' | 'rejected';

export interface TravellerDocument {
  id?: number; // placeholder won't have id
  doc_type: DocType;
  doc_label?: string | null;
  status: DocStatus;
  file_url?: string | null;
  file_name?: string | null;
  rejection_reason?: string | null;
  uploaded_at?: string | null;
  updated_at?: string | null;
}

export interface TravellerDocumentsResponse {
  required: {
    passport: TravellerDocument;
    visa: TravellerDocument;
    id_proof: TravellerDocument;
  };
  supporting: TravellerDocument[];
}
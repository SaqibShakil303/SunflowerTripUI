export type DocumentType = "passport" | "flightTicket" | "visa" | "idProof";
export type DocumentStatus = "not_uploaded" | "pending" | "verified" | "rejected";

export interface DashboardDocument {
  id: string;
  type: DocumentType;
  title: string;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string; // yyyy-MM-dd
  status: DocumentStatus;
  locked: boolean;
  rejectionReason?: string;
}
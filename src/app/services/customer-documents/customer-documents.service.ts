import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.prod';
import { TravellerDocumentsResponse } from '../../models/traveller-documents.model';


@Injectable({ providedIn: 'root' })
export class CustomerDocumentsService {
  private base = environment.apiDomain;

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getTravellerDocuments(bookingId: number, travellerId: number) {
    return this.http.get<TravellerDocumentsResponse>(
      `${this.base}/bookings/${bookingId}/travellers/${travellerId}/documents`,
      this.authHeaders()
    );
  }

  uploadRequired(bookingId: number, travellerId: number, docType: 'passport'|'visa'|'id_proof', file: File) {
    const fd = new FormData();
    fd.append('docType', docType);
    fd.append('file', file);
    return this.http.post(
      `${this.base}/bookings/${bookingId}/travellers/${travellerId}/documents/required`,
      fd,
      this.authHeaders()
    );
  }

  uploadSupporting(bookingId: number, travellerId: number, docLabel: string, file: File) {
    const fd = new FormData();
    fd.append('docLabel', docLabel);
    fd.append('file', file);
    return this.http.post(
      `${this.base}/bookings/${bookingId}/travellers/${travellerId}/documents/supporting`,
      fd,
      this.authHeaders()
    );
  }

  deleteDocument(docId: number) {
    return this.http.delete(`${this.base}/documents/${docId}`, this.authHeaders());
  }
}
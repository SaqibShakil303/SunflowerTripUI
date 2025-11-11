import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  cagegory: string;
  is_active: boolean;
  isOpen?: boolean;
  isDeleting?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiDomain;

  getAllFaqs(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.apiUrl}/faqs/get-all`);
  }
  addFaq(payload: Faq): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/faqs/create`, payload);
  }
  editFaq(payload: Faq): Observable<any> {
    return this.http.put(`${this.apiUrl}/faqs/update/${payload.id}`, payload);
  }

  deleteFaq(payload: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/faqs/delete/${payload}`);
  }
}

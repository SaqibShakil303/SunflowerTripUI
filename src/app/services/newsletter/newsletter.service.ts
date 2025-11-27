import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';
import { isValid } from 'date-fns';

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name?: string;
  subscribed_at: string;
  is_verified: 0 | 1;
  status: 'active' | 'unsubscribed' | 'bounced' | 'spam';
  source: 'website' | 'admin' | 'import' | 'campaign';
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = environment.apiDomain + '/newsletter';

  constructor(private http: HttpClient) {}

  // Public: user subscribe
 subscribe(email: string, name?: string, is_verified?: 0 | 1, status?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { email, name, is_verified, status });
  }

  // Admin: list all
  getSubscribers(): Observable<NewsletterSubscriber[]> {
return this.http.get<NewsletterSubscriber[]>(`${this.apiUrl}/subscribers`);
  }

  // Admin: update
  updateSubscriber(id: number, data: Partial<NewsletterSubscriber>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Admin: delete
  deleteSubscriber(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

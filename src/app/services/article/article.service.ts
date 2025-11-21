import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.dev';

export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  category?: string;
  slug: string;
  status: string;
  cover_image?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  isDeleting?: boolean;
  showMore?: boolean;
  timeToRead?: string;
  summary?: string;
   meta_title?: string;
  meta_description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiDomain;

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles/get-all`);
  }
  addArticle(payload: Article): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/articles/create`, payload);
  }
  editArticle(id: number, payload: Article): Observable<any> {
    return this.http.put(`${this.apiUrl}/articles/update/${id}`, payload);
  }
  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/articles/delete/${id}`);
  }
  getOneArticle(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles/get/${id}`);
  }
  getPublishedArticle(): Observable<any>{
    return this.http.get(`${this.apiUrl}/articles/get?status=published`)
  }
}

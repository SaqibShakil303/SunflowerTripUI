import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.dev';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private apiUrl = environment.apiDomain;
  constructor(private http: HttpClient) {}

  getByUserId(id: number) {
    return this.http.get(`${this.apiUrl}/wishlists/${id}`);
  }

  create({user_id, tour_id}: {
    user_id: number, tour_id: number
  }) {
    return this.http.post(`${this.apiUrl}/wishlists`, {user_id, tour_id})
  }

  deleteById(id: number) {
    return this.http.delete(`${this.apiUrl}/wishlists/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environments.dev';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private apiUrl = environment.apiDomain;

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe( timeout(8000),
      catchError(this.handleError)
    );
  }

    getUserByEmail(email: string) {
    return this.http.get(`${this.apiUrl}/users/${email}`).pipe( timeout(8000), catchError(this.handleError));
  }

  addContactNo(userId: string, contactNo: string) {
    return this.http.post(`${this.apiUrl}/users/add-contact-no`, {userId, contactNo}).pipe(timeout(8000), catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client-side Error: ${error.error.message}`;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
      }
      return throwError(() => new Error(errorMessage));
    }
}

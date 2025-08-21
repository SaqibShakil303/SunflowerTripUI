import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ApplicationModel, JobModel } from '../../models/job.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environments.prod';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = environment.apiDomain + '/jobs';
  private applicationUrl = environment.apiDomain + '/applications';

  constructor(private http: HttpClient) { }

  getAllJobs(): Observable<JobModel[]> {
    return this.http.get<JobModel[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getJobById(id: number): Observable<JobModel> {
    return this.http.get<JobModel>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addJob(data: Partial<JobModel>): Observable<JobModel> {
    return this.http.post<JobModel>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  updateJob(data: Partial<JobModel>): Observable<JobModel> {
    return this.http.put<JobModel>(`${this.apiUrl}/${data.id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  submitApplication(data: Partial<ApplicationModel>): Observable<ApplicationModel> {
    return this.http.post<ApplicationModel>(this.applicationUrl, data).pipe(
      catchError(this.handleError)
    );
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

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment }     from '../../../environments/environments.prod';
import { isPlatformBrowser }               from '@angular/common';

interface Tokens { accessToken: string; refreshToken: string; }
interface AuthResponse { tokens: Tokens; }

@Injectable({ providedIn: 'root' })
export class AuthService {
   private tokensSubject = new BehaviorSubject<Tokens|null>(null);
  tokens$ = this.tokensSubject.asObservable();

  private jwt = new JwtHelperService();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // Only read localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem('tokens');
      if (raw) {
        try {
          this.tokensSubject.next(JSON.parse(raw));
        } catch {}
      }
    }
  }

  signup(email: string, password: string, role: string): Observable<any> {
    return this.http
      .post<AuthResponse>(`${environment.apiDomain}/auth/signup`, { email, password, role })
      .pipe(tap(r => this.persistTokens(r.tokens)));
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<AuthResponse>(`${environment.apiDomain}/auth/login`, { email, password })
      .pipe(tap(r => this.persistTokens(r.tokens)));
  }

  private persistTokens(tokens: Tokens) {
    // Only write localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tokens', JSON.stringify(tokens));
    }
    this.tokensSubject.next(tokens);
  }

refreshToken(): Observable<any> {
    const tokens = this.tokensSubject.value;
    if (!tokens) throw new Error('No tokens available');
    return this.http.post(`${environment.apiDomain}/auth/refresh-token`, { refreshToken: tokens.refreshToken }).pipe(
      tap((response: any) => this.persistTokens(response.tokens))
    );
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tokens');
    }
    this.tokensSubject.next(null);
  }

googleAuth(code: string): Observable<any> {
    console.log('Sending Google auth request with code:', code);
    return this.http.post(`${environment.apiDomain}/auth/google`, { code }, { observe: 'response' }).pipe(
      tap((response: any) => {
        console.log('Google auth response:', response.body);
        this.persistTokens(response.body.tokens);
      })
    );
  }
truecallerAuth(code: string): Observable<any> {
    return this.http.post(`${environment.apiDomain}/auth/truecaller`, { code }).pipe(
      tap((response: any) => this.persistTokens(response.tokens))
    );
  }

 

  private setTokens(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('tokens', JSON.stringify(tokens));
    this.tokensSubject.next(tokens);
  }

  isAuthenticated(): boolean {
    const token = this.tokensSubject.value?.accessToken;
    return !!token && !this.jwt.isTokenExpired(token);
  }

  getUser(): any {
    const token = this.tokensSubject.value?.accessToken;
    return token ? this.jwt.decodeToken(token) : null;
  }

  
  hasRole(roles: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    const userRole = user.role;
    return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
  }
}

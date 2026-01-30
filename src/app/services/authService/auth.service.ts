import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, from, Observable, switchMap, tap, timeout } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environments.prod';
import { isPlatformBrowser } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from '../../auth/google-auth.config';

interface Tokens { accessToken: string; refreshToken: string; }
interface AuthResponse { tokens: Tokens; userRole: string | null; user: any } // Allow null for cases where role is not found

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokensSubject = new BehaviorSubject<Tokens | null>(null);
  tokens$ = this.tokensSubject.asObservable();

  private jwt = new JwtHelperService();

  constructor(
    private oAuth: OAuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // configure OAuth 
    this.oAuth.configure(googleAuthConfig);

    // Only read localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem('tokens');
      if (raw) {
        try {
          this.tokensSubject.next(JSON.parse(raw));
        } catch { }
      }
    }
  }

  signup(payload: {name: string, contactNo: string, email: string, password: string, role: string}): Observable<any> {
    return this.http
      .post<AuthResponse>(`${environment.apiDomain}/auth/signup`, payload)
      .pipe(timeout(8000),tap(r => this.persistTokens(r.tokens)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiDomain}/auth/login`, { email, password })
      .pipe( //timeout(8000),
        tap(response => this.persistToken(response.tokens, response.userRole))
      );
  }

  private persistToken(tokens: Tokens, userRole: string | null) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tokens', JSON.stringify(tokens));
      localStorage.setItem('userRole', userRole || ''); // Store empty string if null
      localStorage.setItem('isLoggedIn', 'true');
    }
    this.tokensSubject.next(tokens);
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
    return this.http.post(`${environment.apiDomain}/auth/refresh-token`, { refreshToken: tokens.refreshToken }).pipe( timeout(8000),
      tap((response: any) => this.persistTokens(response.tokens))
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      const provider = localStorage.getItem('authProvider');
      if(provider === 'google') {
        this.oAuth.revokeTokenAndLogout();
        this.oAuth.logOut();
      }

      localStorage.removeItem('tokens');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authProvider');
    }
    this.tokensSubject.next(null);
  }

  googleAuth(code: string): Observable<any> {
    console.log('Sending Google auth request with code:', code);
    return this.http.post(`${environment.apiDomain}/auth/google`, { code }, { observe: 'response' }).pipe( timeout(8000),
      tap((response: any) => {
        console.log('Google auth response:', response.body);
        this.persistTokens(response.body.tokens);
      })
    );
  }
  truecallerAuth(code: string): Observable<any> {
    return this.http.post(`${environment.apiDomain}/auth/truecaller`, { code }).pipe( timeout(8000),
      tap((response: any) => this.persistTokens(response.tokens))
    );
  }

  // OAuth setup
  // initiate OAuth login page
  googleOAuthLogin() {
    this.oAuth.loadDiscoveryDocument();
    this.oAuth.initLoginFlow();
  }

  // process oauth login request with callback
  processGoogleOAuthLogin(): Observable<any> {
    return from(this.oAuth.loadDiscoveryDocumentAndTryLogin()).pipe(
      filter(() => this.oAuth.hasValidIdToken()),
      switchMap(() =>
        this.http.post(
          `${environment.apiDomain}/auth/sign-in-with-google`,
          { idToken: this.oAuth.getIdToken() }
        )
      )
    );
  }

  storeToken(tokens: Tokens, userRole: string | null, authProvider?: string | null) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tokens', JSON.stringify(tokens));
      localStorage.setItem('userRole', userRole || '');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authProvider', authProvider || 'local');
    }
    this.tokensSubject.next(tokens);
  }


  private setTokens(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('tokens', JSON.stringify(tokens));
    this.tokensSubject.next(tokens);
  }

  isAuthenticated(): boolean {
    const token = this.tokensSubject.value?.accessToken;
    try {
      return !!token && this.jwt.decodeToken(token) && !this.jwt.isTokenExpired(token);
    } catch(err) {
      return false
    }
  }

  getUser(): any {
    const token = this.tokensSubject.value?.accessToken;
    return token ? this.jwt.decodeToken(token) : null;
  }


  getEmailVerificationLink(email: string, name: string) {
    return this.http.post(`${environment.apiDomain}/auth/get-email-verification-link`, {email, name});
  }

  verifyUserEmail(token: string) {
    return this.http.post(`${environment.apiDomain}/auth/verify-email`, {token});
  }
  
  getOtp(userId: string) {
    return this.http.post(`${environment.apiDomain}/auth/get-otp`, {userId});
  }

  verifyOtp(otp: string, userId: string) {
    return this.http.post(`${environment.apiDomain}/auth/verify-otp`, {otp, userId});
  }
  
  hasRole(roles: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    const userRole = user.role;
    return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
  }
}

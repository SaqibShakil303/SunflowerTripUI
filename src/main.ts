import { bootstrapApplication }               from '@angular/platform-browser';
import { importProvidersFrom }               from '@angular/core';
import { provideRouter }                     from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations }                 from '@angular/platform-browser/animations';
import { HttpClientModule }                  from '@angular/common/http';
import { BrowserAnimationsModule }           from '@angular/platform-browser/animations';
import { JwtModule }                         from '@auth0/angular-jwt';

import { AppComponent }                      from './app/app.component';
import { routes }                            from './app/app.routes';
import { MatNativeDateModule } from '@angular/material/core';

export function tokenGetter() {
  const raw = localStorage.getItem('tokens');
  return raw ? JSON.parse(raw).accessToken : null;
}

bootstrapApplication(AppComponent, {
  providers: [
    // 1) your router
    provideRouter(routes),

    // 2) HTTP + interceptor wiring
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(HttpClientModule),

    // 3) animations (only BrowserAnimationsModule)
    provideAnimations(),
    importProvidersFrom(BrowserAnimationsModule),

    // 4) JWT module _for the browser only_
     importProvidersFrom(
      BrowserAnimationsModule,
      MatNativeDateModule
    ),
  ]
})
.catch(err => console.error(err));

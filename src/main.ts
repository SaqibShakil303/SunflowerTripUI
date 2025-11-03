import { bootstrapApplication }               from '@angular/platform-browser';
import { importProvidersFrom }               from '@angular/core';
import { provideRouter,withInMemoryScrolling  }                     from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations }                 from '@angular/platform-browser/animations';
import { HttpClientModule }                  from '@angular/common/http';
import { BrowserAnimationsModule }           from '@angular/platform-browser/animations';
import { JwtModule }                         from '@auth0/angular-jwt';

import { AppComponent }                      from './app/app.component';
import { routes }                            from './app/app.routes';
import { MatNativeDateModule } from '@angular/material/core';
import { authInterceptor } from './app/core/auth.interceptor';

export function tokenGetter() {
  const raw = localStorage.getItem('tokens');
  return raw ? JSON.parse(raw).accessToken : null;
}

bootstrapApplication(AppComponent, {
  providers: [
    // 1) your router
    provideRouter(routes,
       withInMemoryScrolling({
        // 'top' = always go to [0,0] on every forward navigation
        // use 'enabled' if you want back/forward to restore previous position
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',      // supports #fragment scrolling
        // scrollOffset: [0, 0],            // tweak if you have a fixed header
      })
    ),

    provideHttpClient(withInterceptors([authInterceptor])),
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

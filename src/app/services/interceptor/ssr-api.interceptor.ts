import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { of } from 'rxjs';
import { catchError, timeout as rxTimeout } from 'rxjs/operators';

const LIVE_API = 'https://sunflowerofficialapi-production.up.railway.app';

export const ssrApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    // If you call relative /api/..., rewrite to absolute live URL
    let newReq = req;
    if (req.url.startsWith('/api/')) {
      newReq = req.clone({ url: LIVE_API + req.url });
    }

    // Hard timeout so SSR can’t hang
    return next(newReq).pipe(
      rxTimeout({ first: 8000 }),
      catchError((err: unknown) => {
        const status = err instanceof HttpErrorResponse ? err.status : 'no-status';
        console.error('[SSR API ERROR]', newReq.method, newReq.url, status);
        // Return harmless shapes so templates render
        if (newReq.url.includes('/Destination/destinationNames')) return of([] as any);
        if (newReq.url.includes('/Tours/categories')) return of([] as any);
        if (newReq.url.includes('/Tours/getFeaturedTours')) return of([] as any);
        if (newReq.url.match(/\/api\/Destination(\/)?$/)) return of([] as any);
        return of(null as any);
      })
    );
  }

  // Browser: pass through
  return next(req);
};

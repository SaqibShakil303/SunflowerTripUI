// src/app/interceptors/ssr-log.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const ssrLogInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    console.log('[SSR HTTP]', req.method, req.url);
  }

  return next(req);
};

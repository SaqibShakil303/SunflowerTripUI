import { HttpInterceptorFn } from '@angular/common/http';
  
function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('tokens');
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.accessToken ?? null;
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getAccessToken();
  if (!token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};

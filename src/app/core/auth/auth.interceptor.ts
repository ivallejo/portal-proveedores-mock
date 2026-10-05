import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('web-proveedores.access-token');
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      // Sesión vencida o token inválido: se cierra la sesión y se vuelve al login.
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        auth.logout();
        void router.navigate(['/login']);
      }
      // Contraseña temporal sin cambiar (por ejemplo, sesión guardada de antes): se lleva a la pantalla de cambio.
      if (
        error instanceof HttpErrorResponse &&
        error.status === 403 &&
        error.error?.code === 'PASSWORD_CHANGE_REQUIRED'
      ) {
        auth.markPasswordChangeRequired();
        void router.navigateByUrl('/contrasena-temporal');
      }
      return throwError(() => error);
    }),
  );
};

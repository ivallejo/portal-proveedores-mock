import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { GET_ACCESS_TOKEN } from '../../di/auth.tokens';
import { SessionFacade } from '../facades/session.facade';

/** Envía el token de la sesión y reacciona a la sesión vencida (401) o a la contraseña temporal (403). */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionFacade);
  const router = inject(Router);
  const token = inject(GET_ACCESS_TOKEN).execute();
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      // Sesión vencida o token inválido: se cierra la sesión y se vuelve al login.
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        session.logout();
        void router.navigate(['/login']);
      }
      // Contraseña temporal sin cambiar (por ejemplo, sesión guardada de antes): se lleva a la pantalla de cambio.
      if (
        error instanceof HttpErrorResponse &&
        error.status === 403 &&
        error.error?.code === 'PASSWORD_CHANGE_REQUIRED'
      ) {
        session.markPasswordChangeRequired();
        void router.navigateByUrl('/contrasena-temporal');
      }
      return throwError(() => error);
    }),
  );
};

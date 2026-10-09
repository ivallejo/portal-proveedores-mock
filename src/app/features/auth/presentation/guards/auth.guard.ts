import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionFacade } from '../facades/session.facade';

/** Solo usuarios autenticados. */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionFacade);
  // Con contraseña temporal solo se puede entrar a la pantalla para cambiarla.
  if (session.user()?.mustChangePassword) return inject(Router).parseUrl('/contrasena-temporal');
  if (session.user()) return true;
  return inject(Router).createUrlTree(['/login'], {
    queryParams: state.url && state.url !== '/' ? { returnUrl: state.url } : {},
  });
};

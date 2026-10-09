import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionFacade } from '../facades/session.facade';

/** Pantalla de cambio obligatorio: solo para quien tiene sesión con contraseña temporal. */
export const temporaryPasswordGuard: CanActivateFn = () => {
  const session = inject(SessionFacade);
  const router = inject(Router);
  if (!session.user()) return router.parseUrl('/login');
  return session.user()?.mustChangePassword ? true : router.parseUrl(session.landingPath());
};

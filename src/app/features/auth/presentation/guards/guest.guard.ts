import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionFacade } from '../facades/session.facade';

/** Pantallas de acceso: si ya hay sesión, se envía a la pantalla inicial del rol. */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionFacade);
  return session.user() ? inject(Router).parseUrl(session.landingPath()) : true;
};

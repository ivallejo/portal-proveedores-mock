import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionMenuFacade } from '../facades/session-menu.facade';

/** La pantalla debe estar en el menú del usuario (sus permisos, definidos en Roles y permisos). */
export const menuGuard: CanActivateFn = async (_route, state) => {
  // inject() solo funciona antes del primer await: después ya no hay contexto de inyección.
  const menu = inject(SessionMenuFacade);
  const router = inject(Router);
  const path = state.url.split(/[?#]/)[0];
  return (await menu.allows(path)) ? true : router.parseUrl('/inicio');
};

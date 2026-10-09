import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionMenuFacade } from '../facades/session-menu.facade';

/** La pantalla debe estar en el menú del usuario (sus permisos, definidos en Roles y permisos). */
export const menuGuard: CanActivateFn = async (_route, state) => {
  const path = state.url.split(/[?#]/)[0];
  if (await inject(SessionMenuFacade).allows(path)) return true;
  return inject(Router).parseUrl('/inicio');
};

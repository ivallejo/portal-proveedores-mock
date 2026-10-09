import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MenuService } from './menu.service';

/** La pantalla debe estar en el menú del usuario (sus permisos, definidos en Roles y permisos). */
export const menuGuard: CanActivateFn = async (_route, state) => {
  const path = state.url.split(/[?#]/)[0];
  if (await inject(MenuService).allows(path)) return true;
  return inject(Router).parseUrl('/inicio');
};

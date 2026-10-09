import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../domain/models/role';
import { SessionFacade } from '../facades/session.facade';

/** Restringe la ruta a los roles de `data.roles` (el administrador siempre entra). */
export const roleGuard: CanActivateFn = (route) => {
  const session = inject(SessionFacade);
  const roles = route.data['roles'] as Role[] | undefined;
  return session.hasAnyRole(roles) ? true : inject(Router).parseUrl(session.landingPath());
};

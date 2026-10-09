import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionFacade } from '../facades/session.facade';

/**
 * Los correos del backend enlazan a la raíz con `?ruc=…&activationToken=…` o
 * `?ruc=…&resetToken=…` (personal interno: `user=…` en lugar de `ruc=…`), y la verificación de correos con `?emailToken=…`.
 * Se redirige a la pantalla que corresponde.
 */
export const rootRedirectGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const session = inject(SessionFacade);
  const { ruc, user, activationToken, resetToken, emailToken } = route.queryParams;
  // Proveedor: ?ruc=…; personal interno: ?user=… (su DNI).
  const account = ruc ? { ruc } : user ? { user } : null;
  if (emailToken) {
    return router.createUrlTree(['/verificar-correo'], { queryParams: { token: emailToken } });
  }
  if (account && activationToken) {
    session.logout();
    return router.createUrlTree(['/crear-contrasena'], {
      queryParams: { ...account, token: activationToken },
    });
  }
  if (account && resetToken) {
    session.logout();
    return router.createUrlTree(['/cambiar-contrasena'], {
      queryParams: { ...account, token: resetToken },
    });
  }
  return router.parseUrl(session.user() ? session.landingPath() : '/login');
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../shared/models/models';
import { AuthService } from './auth.service';

/** Solo usuarios autenticados. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  // Con contraseña temporal solo se puede entrar a la pantalla para cambiarla.
  if (auth.user()?.mustChangePassword) return inject(Router).parseUrl('/contrasena-temporal');
  if (auth.user()) return true;
  return inject(Router).createUrlTree(['/login'], {
    queryParams: state.url && state.url !== '/' ? { returnUrl: state.url } : {},
  });
};

/** Pantalla de cambio obligatorio: solo para quien tiene sesión con contraseña temporal. */
export const temporaryPasswordGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.user()) return router.parseUrl('/login');
  return auth.user()?.mustChangePassword ? true : router.parseUrl(auth.landingPath());
};

/** Pantallas de acceso: si ya hay sesión, se envía a la pantalla inicial del rol. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.user() ? inject(Router).parseUrl(auth.landingPath()) : true;
};

/** Restringe la ruta a los roles de `data.roles` (el administrador siempre entra). */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const roles = route.data['roles'] as Role[] | undefined;
  return auth.hasAnyRole(roles) ? true : inject(Router).parseUrl(auth.landingPath());
};

/**
 * Los correos del backend enlazan a la raíz con `?ruc=…&activationToken=…`
 * o `?ruc=…&resetToken=…`. Se redirige a la pantalla de contraseña que corresponde.
 */
export const rootRedirectGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const { ruc, activationToken, resetToken } = route.queryParams;
  if (ruc && activationToken) {
    auth.logout();
    return router.createUrlTree(['/crear-contrasena'], {
      queryParams: { ruc, token: activationToken },
    });
  }
  if (ruc && resetToken) {
    auth.logout();
    return router.createUrlTree(['/cambiar-contrasena'], {
      queryParams: { ruc, token: resetToken },
    });
  }
  return router.parseUrl(auth.user() ? auth.landingPath() : '/login');
};

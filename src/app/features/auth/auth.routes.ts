import { Routes } from '@angular/router';
import { guestGuard } from './presentation/guards/guest.guard';
import { temporaryPasswordGuard } from './presentation/guards/temporary-password.guard';

/** Pantallas de acceso (sin el shell del portal). `app.routes.ts` las agrega en la raíz. */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Ingreso · Portal de Proveedores',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./presentation/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'registro',
    title: 'Regístrate · Portal de Proveedores',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./presentation/pages/register-page/register-page.component').then(
        (m) => m.RegisterPageComponent,
      ),
  },
  {
    path: 'recuperar-contrasena',
    title: 'Recuperar contraseña · Portal de Proveedores',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./presentation/pages/forgot-password-page/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPageComponent,
      ),
  },
  {
    path: 'crear-contrasena',
    title: 'Crear contraseña · Portal de Proveedores',
    data: { mode: 'activation' },
    loadComponent: () =>
      import('./presentation/pages/set-password-page/set-password-page.component').then(
        (m) => m.SetPasswordPageComponent,
      ),
  },
  {
    path: 'contrasena-temporal',
    title: 'Cambiar contraseña temporal · Portal de Proveedores',
    canActivate: [temporaryPasswordGuard],
    loadComponent: () =>
      import('./presentation/pages/temporary-password-page/temporary-password-page.component').then(
        (m) => m.TemporaryPasswordPageComponent,
      ),
  },
  {
    path: 'cambiar-contrasena',
    title: 'Cambiar contraseña · Portal de Proveedores',
    data: { mode: 'reset' },
    loadComponent: () =>
      import('./presentation/pages/set-password-page/set-password-page.component').then(
        (m) => m.SetPasswordPageComponent,
      ),
  },
];

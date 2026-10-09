import { Routes } from '@angular/router';
import { EMAIL_VERIFICATION_PROVIDERS, PROFILE_PROVIDERS } from './di/profile.providers';

/** Mi perfil. La ruta padre (`app.routes.ts`) define la URL y el título. */
export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    providers: PROFILE_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent,
      ),
  },
];

/** Enlace «Verificar mi correo» (pública: no requiere sesión). */
export const EMAIL_VERIFICATION_ROUTES: Routes = [
  {
    path: '',
    providers: EMAIL_VERIFICATION_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/verify-email-page/verify-email-page.component').then(
        (m) => m.VerifyEmailPageComponent,
      ),
  },
];

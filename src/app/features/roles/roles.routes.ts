import { Routes } from '@angular/router';
import { ROLES_PROVIDERS } from './di/roles.providers';

/** Configuración › Roles y permisos. La ruta padre (`app.routes.ts`) define la URL, el título y el guard. */
export const ROLES_ROUTES: Routes = [
  {
    path: '',
    providers: ROLES_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/role-list-page/role-list-page.component').then(
        (m) => m.RoleListPageComponent,
      ),
  },
];

import { Routes } from '@angular/router';
import { USERS_PROVIDERS } from './di/users.providers';

/** Configuración › Usuarios. La ruta padre (`app.routes.ts`) define la URL, el título y el guard del menú. */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: USERS_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/user-list-page/user-list-page.component').then(
        (m) => m.UserListPageComponent,
      ),
  },
];

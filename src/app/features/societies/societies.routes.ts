import { Routes } from '@angular/router';
import { SOCIETIES_PROVIDERS } from './di/societies.providers';

/** Configuración › Sociedades. La ruta padre (`app.routes.ts`) define la URL, el título y el guard del menú. */
export const SOCIETIES_ROUTES: Routes = [
  {
    path: '',
    providers: SOCIETIES_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/society-list-page/society-list-page.component').then(
        (m) => m.SocietyListPageComponent,
      ),
  },
];

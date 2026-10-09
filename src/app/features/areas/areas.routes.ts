import { Routes } from '@angular/router';
import { AREAS_PROVIDERS } from './di/areas.providers';

/** Configuración › Áreas. La ruta padre (`app.routes.ts`) define la URL, el título y el guard del menú. */
export const AREAS_ROUTES: Routes = [
  {
    path: '',
    providers: AREAS_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/area-list-page/area-list-page.component').then(
        (m) => m.AreaListPageComponent,
      ),
  },
];

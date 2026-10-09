import { Routes } from '@angular/router';
import { MENUS_PROVIDERS } from './di/menus.providers';

/** Configuración › Menús. La ruta padre (`app.routes.ts`) define la URL, el título y el guard del menú. */
export const MENUS_ROUTES: Routes = [
  {
    path: '',
    providers: MENUS_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/menu-list-page/menu-list-page.component').then(
        (m) => m.MenuListPageComponent,
      ),
  },
];

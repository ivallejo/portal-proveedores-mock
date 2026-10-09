import { Routes } from '@angular/router';

/** Inicio. La ruta padre (`app.routes.ts`) define la URL y el título. */
export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
];

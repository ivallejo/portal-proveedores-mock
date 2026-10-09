import { Routes } from '@angular/router';
import { WORKFLOWS_PROVIDERS } from './di/workflows.providers';

/** Configuración › Workflows. La ruta padre (`app.routes.ts`) define la URL, el título y el guard del menú. */
export const WORKFLOWS_ROUTES: Routes = [
  {
    path: '',
    providers: WORKFLOWS_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/workflow-list-page/workflow-list-page.component').then(
        (m) => m.WorkflowListPageComponent,
      ),
  },
];

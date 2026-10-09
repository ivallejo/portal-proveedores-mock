import { Type, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AUTH_ROUTES, authGuard, roleGuard, rootRedirectGuard } from './features/auth';
import { menuGuard } from './features/menus';
import { FeatureFlag } from './core/config/feature-flag';
import { FEATURE_FLAGS } from './core/config/feature-flags.token';
import { isFeatureEnabled } from './core/config/is-feature-enabled';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

const underConstruction = () =>
  import('./features/under-construction/under-construction-page.component').then(
    (m) => m.UnderConstructionPageComponent,
  );

/** Carga la pantalla real si la funcionalidad está habilitada; si no, «en construcción». */
const gated = (feature: FeatureFlag, load: () => Promise<Type<unknown>>) => () =>
  isFeatureEnabled(inject(FEATURE_FLAGS), feature) ? load() : underConstruction();

/** Igual que `gated`, para las features que exportan sus rutas (`<feature>.routes.ts`). */
const gatedRoutes = (feature: FeatureFlag, load: () => Promise<Routes>) => () =>
  isFeatureEnabled(inject(FEATURE_FLAGS), feature)
    ? load()
    : Promise.resolve<Routes>([{ path: '', loadComponent: underConstruction }]);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  ...AUTH_ROUTES,
  {
    path: 'verificar-correo',
    title: 'Verificar correo · Portal de Proveedores',
    loadComponent: () =>
      import('./features/profile/verify-email-page.component').then(
        (m) => m.VerifyEmailPageComponent,
      ),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        title: 'Inicio · Portal de Proveedores',
        data: { title: 'Inicio' },
        loadComponent: () =>
          import('./features/home/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'orden-pago',
        title: 'Orden de pago · Portal de Proveedores',
        data: { title: 'Orden de pago', roles: ['Proveedor', 'CxP'] },
        canActivate: [menuGuard],
        loadComponent: gated('ordenPago', () =>
          import('./features/payment-orders/payment-orders-page.component').then(
            (m) => m.PaymentOrdersPageComponent,
          ),
        ),
      },
      {
        path: 'estado-factura',
        title: 'Estado de factura · Portal de Proveedores',
        data: { title: 'Estado de factura', roles: ['Proveedor', 'CxP'] },
        canActivate: [menuGuard],
        loadComponent: gated('estadoFactura', () =>
          import('./features/invoice-status/invoice-status-page.component').then(
            (m) => m.InvoiceStatusPageComponent,
          ),
        ),
      },
      {
        path: 'documentos',
        title: 'Documentos · Portal de Proveedores',
        data: { title: 'Documentos', roles: ['Área Usuaria'] },
        canActivate: [menuGuard],
        loadComponent: gated('documentos', () =>
          import('./features/approvals/approvals-page.component').then(
            (m) => m.ApprovalsPageComponent,
          ),
        ),
      },
      {
        path: 'registrar-documento',
        title: 'Registrar documentos · Portal de Proveedores',
        data: { title: 'Registrar documentos', roles: ['Proveedor', 'Colaborador interno'] },
        canActivate: [menuGuard],
        loadComponent: gated('registrarDocumento', () =>
          import('./features/register-document/register-document-page.component').then(
            (m) => m.RegisterDocumentPageComponent,
          ),
        ),
      },
      {
        path: 'contabilizacion',
        title: 'Contabilización · Portal de Proveedores',
        data: { title: 'Contabilización', roles: ['CxP'] },
        canActivate: [menuGuard],
        loadComponent: gated('contabilizacion', () =>
          import('./features/accounting/accounting-page.component').then(
            (m) => m.AccountingPageComponent,
          ),
        ),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · Portal de Proveedores',
        data: { title: 'Mi perfil' },
        loadComponent: gated('perfil', () =>
          import('./features/profile/profile-page.component').then((m) => m.ProfilePageComponent),
        ),
      },
      {
        path: 'configuracion/usuarios',
        title: 'Usuarios · Portal de Proveedores',
        data: { title: 'Usuarios', roles: ['Administrador'] },
        canActivate: [menuGuard],
        loadComponent: gated('usuarios', () =>
          import('./features/settings/users/users-page.component').then(
            (m) => m.UsersPageComponent,
          ),
        ),
      },
      {
        path: 'configuracion/workflows',
        title: 'Workflows de aprobación · Portal de Proveedores',
        data: { title: 'Workflows de aprobación', roles: ['Administrador'] },
        canActivate: [roleGuard],
        loadComponent: gated('workflows', () =>
          import('./features/workflows/pages/workflows-page.component').then(
            (m) => m.WorkflowsPageComponent,
          ),
        ),
      },
      {
        path: 'configuracion/sociedades',
        title: 'Sociedades · Portal de Proveedores',
        data: { title: 'Sociedades', roles: ['Administrador'] },
        canActivate: [menuGuard],
        loadChildren: gatedRoutes('sociedades', () =>
          import('./features/societies').then((m) => m.SOCIETIES_ROUTES),
        ),
      },
      {
        path: 'configuracion/areas',
        title: 'Áreas · Portal de Proveedores',
        data: { title: 'Áreas', roles: ['Administrador'] },
        canActivate: [menuGuard],
        loadChildren: gatedRoutes('areas', () =>
          import('./features/areas').then((m) => m.AREAS_ROUTES),
        ),
      },
      {
        path: 'configuracion/roles',
        title: 'Roles y permisos · Portal de Proveedores',
        data: { title: 'Roles y permisos' },
        canActivate: [menuGuard],
        loadComponent: gated('roles', () =>
          import('./features/settings/access/roles-page.component').then(
            (m) => m.RolesPageComponent,
          ),
        ),
      },
      {
        path: 'configuracion/menus',
        title: 'Menús · Portal de Proveedores',
        data: { title: 'Menús' },
        canActivate: [menuGuard],
        loadChildren: gatedRoutes('menus', () =>
          import('./features/menus').then((m) => m.MENUS_ROUTES),
        ),
      },
      // Opciones creadas en Configuración › Menús que aún no tienen pantalla.
      {
        path: '**',
        title: 'En construcción · Portal de Proveedores',
        data: { title: 'En construcción' },
        canActivate: [menuGuard],
        loadComponent: underConstruction,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

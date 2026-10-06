import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import {
  authGuard,
  guestGuard,
  roleGuard,
  rootRedirectGuard,
  temporaryPasswordGuard,
} from './core/auth/auth.guards';
import { FeatureFlag, isFeatureEnabled } from './core/config/features';
import { ShellComponent } from './core/layout/shell.component';

const underConstruction = () =>
  import('./features/under-construction/under-construction-page.component').then(
    (m) => m.UnderConstructionPageComponent,
  );

/** Carga la pantalla real si la funcionalidad está habilitada; si no, «en construcción». */
const gated = (feature: FeatureFlag, load: () => Promise<Type<unknown>>) => () =>
  isFeatureEnabled(feature) ? load() : underConstruction();

const settings = (path: string, title: string, description: string) => ({
  path,
  title: `${title} · Portal de Proveedores`,
  data: { title, description, roles: ['Administrador'] },
  canActivate: [roleGuard],
  loadComponent: underConstruction,
});

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  {
    path: 'login',
    title: 'Ingreso · Portal de Proveedores',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'registro',
    title: 'Regístrate · Portal de Proveedores',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'recuperar-contrasena',
    title: 'Recuperar contraseña · Portal de Proveedores',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPageComponent,
      ),
  },
  {
    path: 'crear-contrasena',
    title: 'Crear contraseña · Portal de Proveedores',
    data: { mode: 'activation' },
    loadComponent: () =>
      import('./features/auth/pages/set-password-page.component').then(
        (m) => m.SetPasswordPageComponent,
      ),
  },
  {
    path: 'contrasena-temporal',
    title: 'Cambiar contraseña temporal · Portal de Proveedores',
    canActivate: [temporaryPasswordGuard],
    loadComponent: () =>
      import('./features/auth/pages/temporary-password-page.component').then(
        (m) => m.TemporaryPasswordPageComponent,
      ),
  },
  {
    path: 'cambiar-contrasena',
    title: 'Cambiar contraseña · Portal de Proveedores',
    data: { mode: 'reset' },
    loadComponent: () =>
      import('./features/auth/pages/set-password-page.component').then(
        (m) => m.SetPasswordPageComponent,
      ),
  },
  {
    path: '',
    component: ShellComponent,
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
        canActivate: [roleGuard],
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
        canActivate: [roleGuard],
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
        canActivate: [roleGuard],
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
        canActivate: [roleGuard],
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
        canActivate: [roleGuard],
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
        title: 'Usuarios y roles · Portal de Proveedores',
        data: { title: 'Usuarios y roles', roles: ['Administrador'] },
        canActivate: [roleGuard],
        loadComponent: gated('usuarios', () =>
          import('./features/administration/users/pages/admin-users.component').then(
            (m) => m.AdminUsersComponent,
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
        canActivate: [roleGuard],
        loadComponent: gated('sociedades', () =>
          import('./features/settings/organization/companies-page.component').then(
            (m) => m.CompaniesPageComponent,
          ),
        ),
      },
      {
        path: 'configuracion/areas',
        title: 'Áreas · Portal de Proveedores',
        data: { title: 'Áreas', roles: ['Administrador'] },
        canActivate: [roleGuard],
        loadComponent: gated('areas', () =>
          import('./features/settings/organization/areas-page.component').then(
            (m) => m.AreasPageComponent,
          ),
        ),
      },
      settings(
        'configuracion/roles',
        'Roles y permisos',
        'Define qué opciones del menú puede ver cada perfil.',
      ),
      settings(
        'configuracion/menus',
        'Menús',
        'Opciones de navegación del portal en dos niveles, con su ruta, ícono y orden.',
      ),
    ],
  },
  { path: '**', redirectTo: '' },
];

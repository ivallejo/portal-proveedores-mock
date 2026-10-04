import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard, rootRedirectGuard } from './core/auth/auth.guards';
import { ShellComponent } from './core/layout/shell.component';

const settings = (path: string, title: string, description: string) => ({
  path,
  title: `${title} · Portal de Proveedores`,
  data: { title, description, roles: ['Administrador'] },
  canActivate: [roleGuard],
  loadComponent: () =>
    import('./features/settings/coming-soon-page.component').then((m) => m.ComingSoonPageComponent),
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
        path: 'orden-compra',
        title: 'Orden de compra · Portal de Proveedores',
        data: { title: 'Orden de compra', roles: ['Proveedor'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/purchase-orders/purchase-orders-page.component').then(
            (m) => m.PurchaseOrdersPageComponent,
          ),
      },
      {
        path: 'orden-pago',
        title: 'Orden de pago · Portal de Proveedores',
        data: { title: 'Orden de pago', roles: ['Proveedor'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/payment-orders/payment-orders-page.component').then(
            (m) => m.PaymentOrdersPageComponent,
          ),
      },
      {
        path: 'estado-factura',
        title: 'Estado de factura · Portal de Proveedores',
        data: { title: 'Estado de factura', roles: ['Proveedor'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/invoice-status/invoice-status-page.component').then(
            (m) => m.InvoiceStatusPageComponent,
          ),
      },
      {
        path: 'documentos',
        title: 'Documentos · Portal de Proveedores',
        data: { title: 'Documentos', roles: ['Área Usuaria'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/approvals/approvals-page.component').then(
            (m) => m.ApprovalsPageComponent,
          ),
      },
      {
        path: 'registrar-documento',
        title: 'Registrar documentos · Portal de Proveedores',
        data: { title: 'Registrar documentos', roles: ['Proveedor', 'Colaborador interno'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/register-document/register-document-page.component').then(
            (m) => m.RegisterDocumentPageComponent,
          ),
      },
      {
        path: 'contabilizacion',
        title: 'Contabilización · Portal de Proveedores',
        data: { title: 'Contabilización', roles: ['CxP'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/accounting/accounting-page.component').then(
            (m) => m.AccountingPageComponent,
          ),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · Portal de Proveedores',
        data: { title: 'Mi perfil' },
        loadComponent: () =>
          import('./features/profile/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      {
        path: 'configuracion/usuarios',
        title: 'Usuarios y roles · Portal de Proveedores',
        data: { title: 'Usuarios y roles', roles: ['Administrador'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/administration/users/pages/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'configuracion/workflows',
        title: 'Workflows de aprobación · Portal de Proveedores',
        data: { title: 'Workflows de aprobación', roles: ['Administrador'] },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/workflows/pages/workflows-page.component').then(
            (m) => m.WorkflowsPageComponent,
          ),
      },
      settings('configuracion/sociedades', 'Sociedad', 'Sociedades receptoras de los documentos.'),
      settings('configuracion/areas', 'Área', 'Áreas solicitantes y sus aprobadores.'),
      settings('configuracion/centros-costo', 'Centro de costo', 'Centros de costo por sociedad.'),
      settings(
        'configuracion/parametros',
        'Parámetros generales',
        'Parámetros de operación del portal.',
      ),
    ],
  },
  { path: '**', redirectTo: '' },
];

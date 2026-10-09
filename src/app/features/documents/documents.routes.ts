import { Routes } from '@angular/router';
import {
  ACCOUNTING_PROVIDERS,
  APPROVALS_PROVIDERS,
  REGISTRATION_PROVIDERS,
} from './di/documents.providers';

// La ruta padre de cada pantalla (`app.routes.ts`) define la URL, el título y el guard del menú.

/** Documentos por aprobar (bandeja del aprobador). */
export const APPROVAL_INBOX_ROUTES: Routes = [
  {
    path: '',
    providers: APPROVALS_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/approval-inbox-page/approval-inbox-page.component').then(
        (m) => m.ApprovalInboxPageComponent,
      ),
  },
];

/** Registrar documentos. */
export const REGISTER_DOCUMENT_ROUTES: Routes = [
  {
    path: '',
    providers: REGISTRATION_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/register-document-page/register-document-page.component').then(
        (m) => m.RegisterDocumentPageComponent,
      ),
  },
];

/** Contabilización (bandeja de Cuentas por pagar). */
export const ACCOUNTING_INBOX_ROUTES: Routes = [
  {
    path: '',
    providers: ACCOUNTING_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/accounting-inbox-page/accounting-inbox-page.component').then(
        (m) => m.AccountingInboxPageComponent,
      ),
  },
];

import { Routes } from '@angular/router';
import { INVOICE_STATUS_PROVIDERS, PAYMENT_ORDERS_PROVIDERS } from './di/payments.providers';

/** Orden de pago. La ruta padre (`app.routes.ts`) define la URL, el título y el guard del menú. */
export const PAYMENT_ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: PAYMENT_ORDERS_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/payment-order-list-page/payment-order-list-page.component').then(
        (m) => m.PaymentOrderListPageComponent,
      ),
  },
];

/** Estado de factura. La ruta padre (`app.routes.ts`) define la URL, el título y el guard del menú. */
export const INVOICE_STATUS_ROUTES: Routes = [
  {
    path: '',
    providers: INVOICE_STATUS_PROVIDERS,
    loadComponent: () =>
      import('./presentation/pages/invoice-status-page/invoice-status-page.component').then(
        (m) => m.InvoiceStatusPageComponent,
      ),
  },
];

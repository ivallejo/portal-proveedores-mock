import { Provider, inject } from '@angular/core';
import { ExportInvoicesUseCase } from '../application/use-cases/export-invoices.use-case';
import { ExportPaymentOrdersUseCase } from '../application/use-cases/export-payment-orders.use-case';
import { SearchInvoicesUseCase } from '../application/use-cases/search-invoices.use-case';
import { SearchPaymentOrdersUseCase } from '../application/use-cases/search-payment-orders.use-case';
import { InvoiceHttpAdapter } from '../infrastructure/http/invoice-http.adapter';
import { PaymentOrderHttpAdapter } from '../infrastructure/http/payment-order-http.adapter';
import { SupplierScopeFacade } from '../presentation/facades/supplier-scope.facade';
import {
  EXPORT_INVOICES,
  EXPORT_PAYMENT_ORDERS,
  INVOICE_QUERY,
  PAYMENT_ORDER_QUERY,
  SEARCH_INVOICES,
  SEARCH_PAYMENT_ORDERS,
} from './payments.tokens';

/** Orden de pago: sus casos de uso (buscar y exportar), el adaptador HTTP y el contexto del proveedor. */
export const PAYMENT_ORDERS_PROVIDERS: Provider[] = [
  SupplierScopeFacade,
  { provide: PAYMENT_ORDER_QUERY, useClass: PaymentOrderHttpAdapter },
  {
    provide: SEARCH_PAYMENT_ORDERS,
    useFactory: () => new SearchPaymentOrdersUseCase(inject(PAYMENT_ORDER_QUERY)),
  },
  {
    provide: EXPORT_PAYMENT_ORDERS,
    useFactory: () => new ExportPaymentOrdersUseCase(inject(PAYMENT_ORDER_QUERY)),
  },
];

/** Estado de factura: sus casos de uso (buscar y exportar), el adaptador HTTP y el contexto del proveedor. */
export const INVOICE_STATUS_PROVIDERS: Provider[] = [
  SupplierScopeFacade,
  { provide: INVOICE_QUERY, useClass: InvoiceHttpAdapter },
  { provide: SEARCH_INVOICES, useFactory: () => new SearchInvoicesUseCase(inject(INVOICE_QUERY)) },
  { provide: EXPORT_INVOICES, useFactory: () => new ExportInvoicesUseCase(inject(INVOICE_QUERY)) },
];

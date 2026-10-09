import { InjectionToken } from '@angular/core';
import { SearchInvoicesPort } from '../application/ports/in/search-invoices.port';
import { SearchPaymentOrdersPort } from '../application/ports/in/search-payment-orders.port';
import { InvoiceQueryPort } from '../application/ports/out/invoice-query.port';
import { PaymentOrderQueryPort } from '../application/ports/out/payment-order-query.port';

export const SEARCH_PAYMENT_ORDERS = new InjectionToken<SearchPaymentOrdersPort>(
  'SEARCH_PAYMENT_ORDERS',
);
export const SEARCH_INVOICES = new InjectionToken<SearchInvoicesPort>('SEARCH_INVOICES');
export const PAYMENT_ORDER_QUERY = new InjectionToken<PaymentOrderQueryPort>('PAYMENT_ORDER_QUERY');
export const INVOICE_QUERY = new InjectionToken<InvoiceQueryPort>('INVOICE_QUERY');

import { Invoice } from '../models/invoice';
import { InvoiceStage } from '../models/invoice-stage';

export function invoiceStage(status: string): InvoiceStage {
  const text = status.toLowerCase();
  if (text.includes('pagad')) return 'paid';
  if (text.includes('anulad') || text.includes('rechaz') || text.includes('observ')) return 'issue';
  return 'progress';
}

export function countInStage(invoices: readonly Invoice[], stage: InvoiceStage): number {
  return invoices.filter((invoice) => invoiceStage(invoice.status) === stage).length;
}

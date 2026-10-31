import { Observable } from 'rxjs';
import { InvoiceFilter } from '../models/invoice-filter';
import { ExportInvoicesPort } from '../ports/in/export-invoices.port';
import { InvoiceQueryPort } from '../ports/out/invoice-query.port';

export class ExportInvoicesUseCase implements ExportInvoicesPort {
  constructor(private readonly query: InvoiceQueryPort) {}

  execute(filter: InvoiceFilter): Observable<Blob> {
    return this.query.export(filter);
  }
}

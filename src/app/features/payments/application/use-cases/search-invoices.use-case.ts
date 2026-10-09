import { Observable } from 'rxjs';
import { Invoice } from '../../domain/models/invoice';
import { InvoiceFilter } from '../models/invoice-filter';
import { SearchInvoicesPort } from '../ports/in/search-invoices.port';
import { InvoiceQueryPort } from '../ports/out/invoice-query.port';

export class SearchInvoicesUseCase implements SearchInvoicesPort {
  constructor(private readonly query: InvoiceQueryPort) {}

  execute(filter: InvoiceFilter): Observable<Invoice[]> {
    return this.query.search(filter);
  }
}

import { Observable } from 'rxjs';
import { Invoice } from '../../../domain/models/invoice';
import { InvoiceFilter } from '../../models/invoice-filter';

export interface SearchInvoicesPort {
  execute(filter: InvoiceFilter): Observable<Invoice[]>;
}

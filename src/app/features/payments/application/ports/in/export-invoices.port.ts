import { Observable } from 'rxjs';
import { InvoiceFilter } from '../../models/invoice-filter';

export interface ExportInvoicesPort {
  execute(filter: InvoiceFilter): Observable<Blob>;
}

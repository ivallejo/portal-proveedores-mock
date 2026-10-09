import { Observable } from 'rxjs';
import { Invoice } from '../../../domain/models/invoice';
import { InvoiceFilter } from '../../models/invoice-filter';

/** Estado de los comprobantes del proveedor en SAP (hoy, `api/invoices`). */
export interface InvoiceQueryPort {
  search(filter: InvoiceFilter): Observable<Invoice[]>;
}

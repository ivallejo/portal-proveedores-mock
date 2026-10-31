import { Observable } from 'rxjs';
import { PaymentOrderFilter } from '../../models/payment-order-filter';

export interface ExportPaymentOrdersPort {
  execute(filter: PaymentOrderFilter): Observable<Blob>;
}

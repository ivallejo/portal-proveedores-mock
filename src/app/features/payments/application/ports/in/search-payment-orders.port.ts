import { Observable } from 'rxjs';
import { PaymentOrder } from '../../../domain/models/payment-order';
import { PaymentOrderFilter } from '../../models/payment-order-filter';

export interface SearchPaymentOrdersPort {
  execute(filter: PaymentOrderFilter): Observable<PaymentOrder[]>;
}

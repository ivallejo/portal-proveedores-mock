import { Observable } from 'rxjs';
import { PaymentOrder } from '../../domain/models/payment-order';
import { PaymentOrderFilter } from '../models/payment-order-filter';
import { SearchPaymentOrdersPort } from '../ports/in/search-payment-orders.port';
import { PaymentOrderQueryPort } from '../ports/out/payment-order-query.port';

export class SearchPaymentOrdersUseCase implements SearchPaymentOrdersPort {
  constructor(private readonly query: PaymentOrderQueryPort) {}

  execute(filter: PaymentOrderFilter): Observable<PaymentOrder[]> {
    return this.query.search(filter);
  }
}

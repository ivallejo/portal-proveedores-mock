import { Observable } from 'rxjs';
import { PaymentOrderFilter } from '../models/payment-order-filter';
import { ExportPaymentOrdersPort } from '../ports/in/export-payment-orders.port';
import { PaymentOrderQueryPort } from '../ports/out/payment-order-query.port';

export class ExportPaymentOrdersUseCase implements ExportPaymentOrdersPort {
  constructor(private readonly query: PaymentOrderQueryPort) {}

  execute(filter: PaymentOrderFilter): Observable<Blob> {
    return this.query.export(filter);
  }
}

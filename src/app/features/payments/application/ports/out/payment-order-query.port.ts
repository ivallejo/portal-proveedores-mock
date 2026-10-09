import { Observable } from 'rxjs';
import { PaymentOrder } from '../../../domain/models/payment-order';
import { PaymentOrderFilter } from '../../models/payment-order-filter';

/** Órdenes de pago del proveedor en SAP (hoy, `api/payment-orders`). */
export interface PaymentOrderQueryPort {
  search(filter: PaymentOrderFilter): Observable<PaymentOrder[]>;
}

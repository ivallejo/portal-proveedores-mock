import { Currency } from '../models/currency';
import { PaymentOrder } from '../models/payment-order';

/** Total pagado en una moneda. */
export function totalPaidIn(orders: readonly PaymentOrder[], currency: Currency): number {
  return orders
    .filter((order) => order.currency === currency)
    .reduce((total, order) => total + order.total, 0);
}

/** Retenciones o detracciones de todos los comprobantes de la orden. */
export function withheldTotal(order: PaymentOrder, key: 'retention' | 'detraction'): number {
  return order.documents.reduce((sum, doc) => sum + doc[key], 0);
}

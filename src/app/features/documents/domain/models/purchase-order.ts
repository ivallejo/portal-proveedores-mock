import { DeliveryType } from './delivery-type';
import { OrderType } from './order-type';

/** Orden validada en SAP: existe, está aprobada y tiene saldo. */
export interface PurchaseOrder {
  number: string;
  type: OrderType;
  /** Solo en órdenes de servicio. */
  delivery?: DeliveryType;
  description: string;
  balance: number;
}

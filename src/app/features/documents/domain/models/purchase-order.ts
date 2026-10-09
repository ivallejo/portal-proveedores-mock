import { OrderType } from './order-type';

/** Orden validada en SAP: existe, está aprobada y tiene saldo. */
export interface PurchaseOrder {
  number: string;
  type: OrderType;
  description: string;
  balance: number;
}

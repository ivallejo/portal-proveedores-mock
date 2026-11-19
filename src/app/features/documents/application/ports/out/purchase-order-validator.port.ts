import { Observable } from 'rxjs';
import { DeliveryType } from '../../../domain/models/delivery-type';
import { OrderType } from '../../../domain/models/order-type';
import { PurchaseOrder } from '../../../domain/models/purchase-order';

/** Servicio 01 de SAP: la orden existe, está aprobada y tiene saldo; `null` si SAP no la reconoce. */
export interface PurchaseOrderValidatorPort {
  validate(
    companyCode: string,
    type: OrderType,
    delivery: DeliveryType | undefined,
    number: string,
  ): Observable<PurchaseOrder | null>;
}

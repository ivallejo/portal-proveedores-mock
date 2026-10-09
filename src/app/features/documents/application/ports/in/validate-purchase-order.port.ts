import { Observable } from 'rxjs';
import { OrderType } from '../../../domain/models/order-type';
import { PurchaseOrder } from '../../../domain/models/purchase-order';

export interface ValidatePurchaseOrderPort {
  /** `null` si SAP no reconoce la orden. */
  execute(companyCode: string, type: OrderType, number: string): Observable<PurchaseOrder | null>;
}

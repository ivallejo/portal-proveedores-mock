import { Observable } from 'rxjs';
import { OrderType } from '../../domain/models/order-type';
import { PurchaseOrder } from '../../domain/models/purchase-order';
import { ValidatePurchaseOrderPort } from '../ports/in/validate-purchase-order.port';
import { PurchaseOrderValidatorPort } from '../ports/out/purchase-order-validator.port';

export class ValidatePurchaseOrderUseCase implements ValidatePurchaseOrderPort {
  constructor(private readonly validator: PurchaseOrderValidatorPort) {}

  execute(companyCode: string, type: OrderType, number: string): Observable<PurchaseOrder | null> {
    return this.validator.validate(companyCode, type, number.trim().toUpperCase());
  }
}

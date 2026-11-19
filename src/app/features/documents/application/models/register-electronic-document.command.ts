import { DeliveryType } from '../../domain/models/delivery-type';
import { OrderType } from '../../domain/models/order-type';

/** Registro Con OC / Sin OC: XML, PDF, CDR (si aplica) y anexos. */
export interface RegisterElectronicDocumentCommand {
  entryType: 'Con OC' | 'Sin OC';
  companyCode: string;
  order?: { type: OrderType; delivery?: DeliveryType; number: string };
  /** Solo si el documento pasa por aprobación. */
  approverId?: string;
  xml: File;
  pdf: File;
  cdr?: File;
  extras: File[];
}

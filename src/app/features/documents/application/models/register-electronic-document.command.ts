import { OrderType } from '../../domain/models/order-type';

/** Registro Con OC / Sin OC: XML, PDF, CDR (si aplica) y anexos. */
export interface RegisterElectronicDocumentCommand {
  entryType: 'Con OC' | 'Sin OC';
  companyCode: string;
  isPettyCash: boolean;
  order?: { type: OrderType; number: string };
  /** Solo si el documento pasa por aprobación. */
  approverId?: string;
  xml: File;
  pdf: File;
  cdr?: File;
  extras: File[];
}

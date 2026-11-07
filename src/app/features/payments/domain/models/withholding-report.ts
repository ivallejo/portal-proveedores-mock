import { PaidDocument } from './paid-document';
import { PaymentOrder } from './payment-order';
import { WithholdingKind } from './withholding-kind';

/** Informe que genera el portal para un número de constancia o de comprobante de retención. */
export interface WithholdingReport {
  kind: WithholdingKind;
  number: string;
  order: PaymentOrder;
  /** Comprobantes de la orden con ese número. */
  documents: PaidDocument[];
  total: number;
}

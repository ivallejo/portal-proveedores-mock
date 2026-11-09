import { PaymentOrder } from './payment-order';
import { WithholdingReport } from './withholding-report';

/** Documento abierto en la vista previa en PDF. */
export type PaymentPdfDocument = { kind: 'order'; order: PaymentOrder } | WithholdingReport;

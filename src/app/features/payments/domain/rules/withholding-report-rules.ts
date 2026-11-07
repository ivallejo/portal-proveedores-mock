import { PaidDocument } from '../models/paid-document';
import { PaymentOrder } from '../models/payment-order';
import { PaymentPdfDocument } from '../models/payment-pdf-document';
import { WithholdingKind } from '../models/withholding-kind';
import { WithholdingReport } from '../models/withholding-report';

const REPORT_NAME: Record<WithholdingKind, string> = {
  detraction: 'Informe de detracciones',
  retention: 'Informe de retenciones',
};

function reportNumber(doc: PaidDocument, kind: WithholdingKind): string | null {
  return kind === 'detraction' ? doc.detractionCertificate : doc.retentionDocument;
}

/** Arma el informe con todos los comprobantes de la orden que comparten el número. */
export function withholdingReport(
  order: PaymentOrder,
  kind: WithholdingKind,
  number: string,
): WithholdingReport {
  const documents = order.documents.filter((doc) => reportNumber(doc, kind) === number);
  const total = documents.reduce((sum, doc) => sum + doc[kind], 0);
  return { kind, number, order, documents, total };
}

/** Nombre del documento, p. ej. «Orden de pago» o «Informe de detracciones». */
export function pdfDocumentName(document: PaymentPdfDocument): string {
  return document.kind === 'order' ? 'Orden de pago' : REPORT_NAME[document.kind];
}

/** Nombre del archivo que se propone al guardar la vista previa como PDF. */
export function pdfFileName(document: PaymentPdfDocument): string {
  if (document.kind === 'order') return `OP-${document.order.number}.pdf`;
  const prefix = document.kind === 'detraction' ? 'detracciones' : 'retenciones';
  return `Informe-${prefix}-${document.number}.pdf`;
}

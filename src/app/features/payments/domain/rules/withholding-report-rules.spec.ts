import { PaidDocument } from '../models/paid-document';
import { PaymentOrder } from '../models/payment-order';
import { pdfDocumentName, pdfFileName, withholdingReport } from './withholding-report-rules';

const doc = (number: string, values: Partial<PaidDocument>): PaidDocument =>
  ({
    number,
    retention: 0,
    detraction: 0,
    retentionDocument: null,
    detractionCertificate: null,
    ...values,
  }) as PaidDocument;

const order = {
  number: '2000000123',
  documents: [
    doc('F001-1', { detraction: 100, detractionCertificate: '316991800' }),
    doc('F001-2', { detraction: 50.5, detractionCertificate: '316991800' }),
    doc('F001-3', { detraction: 70, detractionCertificate: '316991801' }),
    doc('F001-4', { retention: 30, retentionDocument: 'R001-0001' }),
  ],
} as PaymentOrder;

describe('withholding report rules', () => {
  it('reúne los comprobantes de la misma constancia y suma su detracción', () => {
    const report = withholdingReport(order, 'detraction', '316991800');
    expect(report.documents.map((item) => item.number)).toEqual(['F001-1', 'F001-2']);
    expect(report.total).toBe(150.5);
  });

  it('arma el informe de un comprobante de retención', () => {
    const report = withholdingReport(order, 'retention', 'R001-0001');
    expect(report.documents.map((item) => item.number)).toEqual(['F001-4']);
    expect(report.total).toBe(30);
  });

  it('nombra el documento y su archivo', () => {
    const detraction = withholdingReport(order, 'detraction', '316991800');
    const retention = withholdingReport(order, 'retention', 'R001-0001');
    const orderDocument = { kind: 'order', order } as const;
    expect(pdfFileName(detraction)).toBe('Informe-detracciones-316991800.pdf');
    expect(pdfFileName(retention)).toBe('Informe-retenciones-R001-0001.pdf');
    expect(pdfFileName(orderDocument)).toBe('OP-2000000123.pdf');
    expect(pdfDocumentName(detraction)).toBe('Informe de detracciones');
    expect(pdfDocumentName(retention)).toBe('Informe de retenciones');
    expect(pdfDocumentName(orderDocument)).toBe('Orden de pago');
  });
});

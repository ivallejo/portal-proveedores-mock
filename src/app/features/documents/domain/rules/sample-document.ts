import { DocumentItem } from '../models/document-item';
import { ElectronicDocument } from '../models/electronic-document';
import { SampleDocumentContext } from '../models/sample-document-context';
import { seriesFromFileName } from './registration-rules';

/**
 * Comprobante de ejemplo cuando el XML no es un UBL válido, para que el flujo pueda probarse con cualquier archivo.
 * La serie y el número salen del nombre del archivo si los trae.
 */
export function sampleElectronicDocument(
  fileName: string | null,
  context: SampleDocumentContext,
  today: string,
  now = Date.now(),
): ElectronicDocument {
  const series = (fileName && seriesFromFileName(fileName)) || 'F001';
  const isFee = series.startsWith('E');
  const items: DocumentItem[] =
    context.entry === 'Con OC'
      ? isFee
        ? [
            {
              description: 'Servicio de asesoría técnica en mantenimiento',
              quantity: 1,
              unitPrice: 3500,
            },
          ]
        : [
            {
              description: 'Mantenimiento correctivo de compresores – Planta Lurín',
              quantity: 1,
              unitPrice: 12500,
            },
            {
              description: 'Repuestos: kit de válvulas y empaquetaduras',
              quantity: 2,
              unitPrice: 1567.7966,
            },
          ]
      : isFee
        ? [
            {
              description: 'Asesoría tributaria – cierre tercer trimestre 2026',
              quantity: 1,
              unitPrice: 3500,
            },
          ]
        : [
            {
              description: 'Reparación de tableros eléctricos – nave 2',
              quantity: 1,
              unitPrice: 6000,
            },
          ];
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const igv = isFee ? null : +(subtotal * 0.18).toFixed(2);
  const fileNumber = fileName?.match(/([A-Z0-9]{4}-\d{1,8})/i)?.[1]?.toUpperCase();
  const number =
    fileNumber ?? `${series}-${String(Math.floor(now / 1000) % 100000000).padStart(8, '0')}`;
  return {
    number,
    series,
    documentType: isFee ? 'Recibo por honorarios electrónico' : 'Factura electrónica',
    issuerName: context.issuerName,
    issuerRuc: context.issuerRuc,
    receiverName: context.receiverName,
    receiverRuc: context.receiverRuc,
    issuedAt: today,
    currency: 'PEN',
    paymentTerms: 'Crédito a 30 días',
    items,
    subtotal,
    igv,
    total: +(subtotal + (igv ?? 0)).toFixed(2),
    fromXml: false,
  };
}

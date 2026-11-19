import { DeliveryType } from '../models/delivery-type';
import { ElectronicDocument } from '../models/electronic-document';
import { OrderType } from '../models/order-type';
import { PortalDocument } from '../models/portal-document';

/** Tamaño máximo de cada archivo adjunto. */
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

/** Archivo vacío, con extensión no permitida o más grande que el máximo. */
export function attachmentError(
  file: { name: string; size: number } | undefined,
  accept: readonly string[],
): string {
  if (!file) return 'No recibimos ningún archivo.';
  if (!accept.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return `El archivo debe ser ${accept.join(' o ')}. Recibimos «${file.name}».`;
  }
  if (file.size > MAX_ATTACHMENT_SIZE) return 'El archivo supera los 5 MB permitidos.';
  return '';
}

/** Serie a partir del nombre del archivo («F001-00004530.xml» → «F001»). */
export function seriesFromFileName(name: string): string | null {
  const match = /([A-Z0-9]{4})-\d{1,8}/i.exec(name);
  return match ? match[1].toUpperCase() : null;
}

/** Los recibos por honorarios (serie E…) no tienen CDR. */
export function isCdrRequired(series: string): boolean {
  return !series.startsWith('E');
}

/** El proveedor solo registra comprobantes emitidos por su RUC. */
export function issuerMismatchError(
  doc: ElectronicDocument,
  providerRuc: string | undefined,
): string {
  if (!doc.fromXml || !providerRuc || !doc.issuerRuc || doc.issuerRuc === providerRuc) return '';
  return `El XML fue emitido por el RUC ${doc.issuerRuc}. Solo puedes registrar documentos emitidos por tu RUC.`;
}

/** Importe escrito por el usuario («1,250.50» → 1250.5). */
export function parseAmount(value: string): number {
  return Number(value.replace(/,/g, ''));
}

/** Con bien o con servicio entregado en almacén se valida un N° de carrier; si no, el N° de orden de compra. */
export function isCarrierOrder(type: OrderType, delivery: DeliveryType | undefined): boolean {
  return type === 'Bien' || delivery === 'Entregado en almacén';
}

/** Tipo de entrega que se envía a SAP: solo en órdenes de servicio (a bordo por defecto). */
export function orderDelivery(type: OrderType, delivery: DeliveryType): DeliveryType | undefined {
  return type === 'Servicio' ? delivery : undefined;
}

/** Etiqueta, ejemplo y nombre del número de la orden según su tipo. */
export function orderNumberField(
  type: OrderType,
  delivery: DeliveryType | undefined,
): { label: string; placeholder: string; noun: string } {
  if (type === 'Bien')
    return { label: 'N° de carrier', placeholder: 'Ej. CR-2026-00418', noun: 'el carrier' };
  return isCarrierOrder(type, delivery)
    ? { label: 'N° de carrier', placeholder: 'Ej. CR-2026-00527', noun: 'el carrier' }
    : { label: 'N° de orden de compra', placeholder: 'Ej. 4500012873', noun: 'la orden de compra' };
}

/** «La factura», «La nota de crédito», «El recibo por honorarios»… con su género para concordar el texto. */
export function documentNoun(documentType: string): { noun: string; feminine: boolean } {
  const type = documentType.toLowerCase().replace(/ electrónic[oa]$/, '');
  if (type.startsWith('factura')) return { noun: 'La factura', feminine: true };
  if (type.startsWith('nota de')) return { noun: `La ${type}`, feminine: true };
  if (type.startsWith('recibo')) return { noun: `El ${type}`, feminine: false };
  return { noun: 'El documento', feminine: false };
}

/** Texto del resultado de un registro correcto (diseño de la Propuesta 4). */
export function registeredText(doc: PortalDocument): string {
  if (doc.entryType === 'Documento especial')
    return `El ${doc.documentType.toLowerCase()} ${doc.number} se registró correctamente con estado ${doc.status}.`;
  const { noun, feminine } = documentNoun(doc.documentType);
  const ending = feminine ? 'a' : 'o';
  if (doc.entryType === 'Con OC')
    return `${noun} ${doc.number} quedó asociad${ending} a la orden ${doc.orderNumber ?? ''} con estado ${doc.status}.`;
  if (doc.status === 'Pendiente de aprobación')
    return `${noun} ${doc.number} fue enviad${ending} a ${doc.approver ?? 'el aprobador'} para su aprobación. Le enviamos un correo con el detalle.`;
  return `${noun} ${doc.number} se registró directamente como ${doc.status}.`;
}

/** Texto del rechazo de un documento electrónico por SAP o por duplicado. */
export function rejectedElectronicText(number: string, companyName: string): string {
  return `SAP rechazó el documento ${number}: ya fue registrado anteriormente para ${companyName || 'la sociedad'} o su contenido no coincide con la validación de SUNAT.`;
}

/** Texto del rechazo de un documento especial. */
export function rejectedSpecialText(number: string, ruc: string): string {
  return `SUNAT no reconoce el documento ${number} para el RUC ${ruc || '—'}, o ya fue registrado en SAP. Verifica los datos del documento.`;
}

import { ElectronicDocument } from '../models/electronic-document';

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

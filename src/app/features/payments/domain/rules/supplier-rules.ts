import { QueryPeriod } from '../models/query-period';

/** Rango máximo de una consulta a SAP: 1 mes (31 días con ambos extremos), igual que el backend (PaymentQueryService.MaxRangeDays). */
export const MAX_QUERY_DAYS = 31;

/** El proveedor consulta siempre su propio RUC; Cuentas por pagar y el administrador indican el RUC. */
export function isSupplierUser(roles: readonly string[]): boolean {
  return roles.includes('Proveedor') && !roles.includes('Administrador');
}

/** Mensaje si falta el RUC (solo cuando no es proveedor); vacío si se puede consultar. */
export function missingRucError(isSupplier: boolean, ruc: string): string {
  return isSupplier || /^\d{11}$/.test(ruc) ? '' : 'Ingresa el RUC del proveedor (11 dígitos).';
}

/** Solo dígitos, hasta 11. */
export function normalizeRuc(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

/** Serie y número del comprobante en mayúsculas, hasta 13 caracteres. */
export function normalizeDocumentNumber(value: string): string {
  return value.toUpperCase().slice(0, 13);
}

/** Últimos 31 días hasta hoy (el rango máximo). */
export function defaultQueryPeriod(today = new Date()): QueryPeriod {
  const from = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - (MAX_QUERY_DAYS - 1),
  );
  return { from: isoDate(from), to: isoDate(today) };
}

/** Nombre del Excel descargado, igual al que arma el backend: `prefijo_RUC_desde_hasta.xlsx`. */
export function exportFileName(prefix: string, ruc: string, period: QueryPeriod): string {
  return `${prefix}_${ruc}_${period.from}_${period.to}.xlsx`;
}

function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

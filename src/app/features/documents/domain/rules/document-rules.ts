import { DocumentStatus } from '../models/document-status';
import { PortalDocument } from '../models/portal-document';
import { SpecialDocumentType } from '../models/special-document-type';

export const SPECIAL_DOCUMENT_TYPES: SpecialDocumentType[] = [
  'Boleto aéreo',
  'Recibo público',
  'No domiciliado',
  'Liquidación de cobranzas',
];

/** Estados que ve la bandeja del aprobador. */
export const APPROVAL_STATUSES: DocumentStatus[] = [
  'Pendiente de aprobación',
  'Aprobado',
  'Pendiente de contabilización',
  'Rechazado',
];

/** Estados que ve la bandeja de Cuentas por pagar. */
export const ACCOUNTING_STATUSES: DocumentStatus[] = [
  'Pendiente de contabilización',
  'Contabilizado',
  'Observado',
  'Rechazado',
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function countWithStatus(
  documents: readonly PortalDocument[],
  status: DocumentStatus,
): number {
  return documents.filter((doc) => doc.status === status).length;
}

/** Correo al que Cuentas por pagar envía una observación. */
export function isValidObservationEmail(email: string): boolean {
  return EMAIL.test(email);
}

/** Personal interno que no es proveedor. */
export function isInternalCollaborator(roles: readonly string[]): boolean {
  return roles.includes('Colaborador interno') && !roles.includes('Proveedor');
}

/** Los documentos especiales los registra personal interno (o el administrador), no el proveedor. */
export function canRegisterSpecialDocuments(roles: readonly string[], isAdmin: boolean): boolean {
  return isInternalCollaborator(roles) || isAdmin;
}

/** Con orden de compra lo registra el proveedor (flujo 01); el administrador también, para soporte. */
export function canRegisterWithPurchaseOrder(roles: readonly string[], isAdmin: boolean): boolean {
  return roles.includes('Proveedor') || isAdmin;
}

/**
 * Sin orden de compra (flujo 02): solo el proveedor elige área y aprobador; el usuario interno (y el administrador)
 * registran directo como Pendiente de contabilización.
 */
export function needsApprover(roles: readonly string[], isAdmin: boolean): boolean {
  return roles.includes('Proveedor') && !isAdmin;
}

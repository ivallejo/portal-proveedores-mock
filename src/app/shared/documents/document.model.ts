import { Tone } from '../ui/tone';
import { Currency } from '../utils/format';

export type EntryType = 'Con OC' | 'Sin OC' | 'Documento especial';

export type DocumentStatus =
  | 'Pendiente de aprobación'
  | 'Aprobado'
  | 'Pendiente de contabilización'
  | 'Contabilizado'
  | 'Observado'
  | 'Rechazado';

export type SpecialDocumentType =
  'Boleto aéreo' | 'Recibo público' | 'No domiciliado' | 'Liquidación de cobranzas';

export const SPECIAL_DOCUMENT_TYPES: SpecialDocumentType[] = [
  'Boleto aéreo',
  'Recibo público',
  'No domiciliado',
  'Liquidación de cobranzas',
];

export interface DocumentItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface HistoryEvent {
  title: string;
  who: string;
  when: string;
  kind: 'done' | 'current' | 'bad' | 'warn';
  note?: string;
}

export interface Attachment {
  tag: 'XML' | 'PDF' | 'CDR' | 'ZIP';
  name: string;
}

export interface PortalDocument {
  number: string;
  entryType: EntryType;
  documentType: string;
  providerName: string;
  providerRuc: string;
  providerEmail: string;
  currency: Currency;
  subtotal: number;
  igv: number | null;
  amount: number;
  items: DocumentItem[];
  concept: string;
  issuedAt: string;
  registeredAt: string;
  registeredBy: string;
  companyCode: string;
  status: DocumentStatus;
  /** Documento de Caja Chica: se registra sin pasar por aprobación. */
  isPettyCash?: boolean;
  /** Quién rechazó el documento: el aprobador o Cuentas por pagar. */
  rejectedBy?: 'aprobador' | 'contabilidad';
  area?: string;
  approver?: string;
  approverEmail?: string;
  approvedAt?: string;
  orderType?: 'Bien' | 'Servicio';
  orderNumber?: string;
  orderBalance?: number;
  orderDescription?: string;
  /** Resultado de la validación de un documento especial. */
  validation?: string;
  attachments: Attachment[];
  history: HistoryEvent[];
}

export const STATUS_TONE: Record<DocumentStatus, Tone> = {
  'Pendiente de aprobación': 'warn',
  Aprobado: 'teal',
  'Pendiente de contabilización': 'info',
  Contabilizado: 'success',
  Observado: 'warn',
  Rechazado: 'danger',
};

export const ENTRY_TONE: Record<EntryType, Tone> = {
  'Con OC': 'primary',
  'Sin OC': 'purple',
  'Documento especial': 'teal',
};

export const ENTRY_LABEL: Record<EntryType, string> = {
  'Con OC': 'Con orden de compra',
  'Sin OC': 'Sin orden de compra',
  'Documento especial': 'Documento especial',
};

/** Etiquetas de colores de los tipos de archivo adjunto. */
export const ATTACHMENT_TONE: Record<Attachment['tag'], string> = {
  XML: 'bg-[#E8F0FE] text-[#1E3FA8]',
  PDF: 'bg-[#FDE8E8] text-[#A51E1E]',
  CDR: 'bg-[#DFF4F4] text-[#0B5E61]',
  ZIP: 'bg-[#EDE7FB] text-[#5B3AA8]',
};

/** Persona que ejecuta una acción, para el historial. */
export interface Actor {
  name: string;
  area?: string;
}

export function actorLabel(actor: Actor): string {
  return actor.area ? `${actor.name} · ${actor.area}` : actor.name;
}

import { Attachment } from './attachment';
import { Currency } from './currency';
import { DocumentItem } from './document-item';
import { DocumentStatus } from './document-status';
import { EntryType } from './entry-type';
import { HistoryEvent } from './history-event';
import { OrderType } from './order-type';
import { RejectionStage } from './rejection-stage';

/** Documento registrado en el portal (comprobante electrónico o documento especial). */
export interface PortalDocument {
  /** Identificador del documento en el backend. */
  id: string;
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
  companyName: string;
  companyRuc: string;
  status: DocumentStatus;
  /** Documento de Caja Chica: se registra sin pasar por aprobación. */
  isPettyCash?: boolean;
  /** Quién rechazó el documento: el aprobador o Cuentas por pagar. */
  rejectedBy?: RejectionStage;
  area?: string;
  approverId?: string;
  approver?: string;
  approverEmail?: string;
  approvedAt?: string;
  orderType?: OrderType;
  orderNumber?: string;
  orderBalance?: number;
  orderDescription?: string;
  /** Resultado de la validación de un documento especial. */
  validation?: string;
  attachments: Attachment[];
  history: HistoryEvent[];
}

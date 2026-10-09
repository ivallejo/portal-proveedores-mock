import { nowStamp } from '../utils/date-format.util';
import {
  Attachment,
  DocumentStatus,
  EntryType,
  HistoryEvent,
  PortalDocument,
} from './document.model';

/** Estados tal como los publica el backend. */
export type ApiStatus =
  'PendingApproval' | 'Approved' | 'PendingAccounting' | 'Accounted' | 'Observed' | 'Rejected';

type ApiEntryType = 'WithPurchaseOrder' | 'WithoutPurchaseOrder' | 'Special';

export interface ApiDocumentSummary {
  id: string;
  number: string;
  entryType: ApiEntryType;
  documentType: string;
  providerRuc: string;
  providerName: string;
  currency: 'PEN' | 'USD';
  amount: number;
  status: ApiStatus;
  isPettyCash: boolean;
  issuedAt: string;
  registeredAtUtc: string;
  approverName: string | null;
  orderNumber: string | null;
}

export interface ApiDocumentDetail {
  id: string;
  number: string;
  entryType: ApiEntryType;
  documentType: string;
  providerRuc: string;
  providerName: string;
  providerEmail: string | null;
  currency: 'PEN' | 'USD';
  subtotal: number;
  igv: number | null;
  amount: number;
  concept: string;
  issuedAt: string;
  registeredAtUtc: string;
  registeredBy: string;
  company: { code: string; name: string; ruc: string | null };
  status: ApiStatus;
  isPettyCash: boolean;
  rejectedBy: 'Approver' | 'Accounting' | null;
  areaName: string | null;
  approverName: string | null;
  approverEmail: string | null;
  approvedAtUtc: string | null;
  approvalReference: string | null;
  orderType: 'Goods' | 'Service' | null;
  orderNumber: string | null;
  orderBalance: number | null;
  orderDescription: string | null;
  validation: string | null;
  items: { description: string; quantity: number; unitPrice: number; amount: number }[];
  attachments: { id: string; kind: 'Xml' | 'Pdf' | 'Cdr' | 'Support'; fileName: string }[];
  history: {
    title: string;
    actor: string;
    kind: 'Done' | 'Current' | 'Bad' | 'Warn';
    occurredAtUtc: string;
    note: string | null;
  }[];
}

export interface ApiPage {
  items: ApiDocumentSummary[];
  total: number;
}

const STATUS: Record<ApiStatus, DocumentStatus> = {
  PendingApproval: 'Pendiente de aprobación',
  Approved: 'Aprobado',
  PendingAccounting: 'Pendiente de contabilización',
  Accounted: 'Contabilizado',
  Observed: 'Observado',
  Rejected: 'Rechazado',
};

const ENTRY: Record<ApiEntryType, EntryType> = {
  WithPurchaseOrder: 'Con OC',
  WithoutPurchaseOrder: 'Sin OC',
  Special: 'Documento especial',
};

const ATTACHMENT_TAG: Record<string, Attachment['tag']> = {
  Xml: 'XML',
  Pdf: 'PDF',
  Cdr: 'CDR',
  Support: 'PDF',
};

export function toApiStatus(status: string): ApiStatus | '' {
  const entry = Object.entries(STATUS).find(([, label]) => label === status);
  return (entry?.[0] as ApiStatus | undefined) ?? '';
}

/** El backend manda fechas en UTC con hora; la interfaz muestra «dd/mm/aaaa · hh:mm» local. */
function stamp(utc: string): string {
  return nowStamp(new Date(utc.endsWith('Z') ? utc : `${utc}Z`));
}

function localDate(utc: string): string {
  const date = new Date(utc.endsWith('Z') ? utc : `${utc}Z`);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Fila de un listado: trae lo justo; el detalle se completa con `fromDetail`. */
export function fromSummary(item: ApiDocumentSummary): PortalDocument {
  return {
    id: item.id,
    number: item.number,
    entryType: ENTRY[item.entryType],
    documentType: item.documentType,
    providerName: item.providerName,
    providerRuc: item.providerRuc,
    providerEmail: '',
    currency: item.currency,
    subtotal: item.amount,
    igv: null,
    amount: item.amount,
    items: [],
    concept: '',
    issuedAt: item.issuedAt,
    registeredAt: localDate(item.registeredAtUtc),
    registeredBy: '',
    companyCode: '',
    companyName: '',
    companyRuc: '',
    status: STATUS[item.status],
    isPettyCash: item.isPettyCash,
    approver: item.approverName ?? undefined,
    orderNumber: item.orderNumber ?? undefined,
    attachments: [],
    history: [],
  };
}

export function fromDetail(item: ApiDocumentDetail): PortalDocument {
  const history: HistoryEvent[] = item.history.map((event) => ({
    title: event.title,
    who: event.actor,
    when: stamp(event.occurredAtUtc),
    kind: event.kind.toLowerCase() as HistoryEvent['kind'],
    note: event.note ?? undefined,
  }));
  return {
    id: item.id,
    number: item.number,
    entryType: ENTRY[item.entryType],
    documentType: item.documentType,
    providerName: item.providerName,
    providerRuc: item.providerRuc,
    providerEmail: item.providerEmail ?? '',
    currency: item.currency,
    subtotal: item.subtotal,
    igv: item.igv,
    amount: item.amount,
    items: item.items.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
    concept: item.concept,
    issuedAt: item.issuedAt,
    registeredAt: localDate(item.registeredAtUtc),
    registeredBy: item.registeredBy,
    companyCode: item.company.code,
    companyName: item.company.name,
    companyRuc: item.company.ruc ?? '',
    status: STATUS[item.status],
    isPettyCash: item.isPettyCash,
    rejectedBy:
      item.rejectedBy === 'Accounting' ? 'contabilidad' : item.rejectedBy ? 'aprobador' : undefined,
    area: item.areaName ?? undefined,
    approver: item.approverName ?? undefined,
    approverEmail: item.approverEmail ?? undefined,
    approvedAt: item.approvedAtUtc ? stamp(item.approvedAtUtc) : undefined,
    orderType:
      item.orderType === 'Goods' ? 'Bien' : item.orderType === 'Service' ? 'Servicio' : undefined,
    orderNumber: item.orderNumber ?? undefined,
    orderBalance: item.orderBalance ?? undefined,
    orderDescription: item.orderDescription ?? undefined,
    validation: item.validation ?? undefined,
    attachments: item.attachments.map((file) => ({
      id: file.id,
      tag: ATTACHMENT_TAG[file.kind] ?? 'PDF',
      name: file.fileName,
    })),
    history,
  };
}

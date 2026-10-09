import { nowStamp } from '../../../../shared/utils/date-format.util';
import { RegisterElectronicDocumentCommand } from '../../application/models/register-electronic-document.command';
import { RegisterSpecialDocumentCommand } from '../../application/models/register-special-document.command';
import { AttachmentTag } from '../../domain/models/attachment-tag';
import { DocumentStatus } from '../../domain/models/document-status';
import { EntryType } from '../../domain/models/entry-type';
import { HistoryEventKind } from '../../domain/models/history-event-kind';
import { OrderType } from '../../domain/models/order-type';
import { PortalDocument } from '../../domain/models/portal-document';
import { PurchaseOrder } from '../../domain/models/purchase-order';
import { SpecialDocumentType } from '../../domain/models/special-document-type';
import { ApiDocumentStatus } from '../http/dto/api-document-status';
import { ApiEntryType } from '../http/dto/api-entry-type';
import { DocumentDetailResponseDto } from '../http/dto/document-detail-response.dto';
import { DocumentSummaryResponseDto } from '../http/dto/document-summary-response.dto';
import { PurchaseOrderResponseDto } from '../http/dto/purchase-order-response.dto';

const STATUS: Record<ApiDocumentStatus, DocumentStatus> = {
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

const ATTACHMENT_TAG: Record<string, AttachmentTag> = {
  Xml: 'XML',
  Pdf: 'PDF',
  Cdr: 'CDR',
  Support: 'PDF',
};

const SPECIAL_TYPE_CODES: Record<SpecialDocumentType, string> = {
  'Boleto aéreo': 'AirTicket',
  'Recibo público': 'PublicReceipt',
  'No domiciliado': 'NonDomiciled',
  'Liquidación de cobranzas': 'CollectionSettlement',
};

export function toApiStatus(status: string): ApiDocumentStatus | '' {
  const entry = Object.entries(STATUS).find(([, label]) => label === status);
  return (entry?.[0] as ApiDocumentStatus | undefined) ?? '';
}

export function toApiOrderType(type: OrderType): 'Goods' | 'Service' {
  return type === 'Bien' ? 'Goods' : 'Service';
}

function fromApiOrderType(type: 'Goods' | 'Service' | null): OrderType | undefined {
  return type === 'Goods' ? 'Bien' : type === 'Service' ? 'Servicio' : undefined;
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

/** Fila de un listado: trae lo justo; el detalle se completa con `toPortalDocument`. */
export function toDocumentSummary(item: DocumentSummaryResponseDto): PortalDocument {
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

export function toPortalDocument(item: DocumentDetailResponseDto): PortalDocument {
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
    orderType: fromApiOrderType(item.orderType),
    orderNumber: item.orderNumber ?? undefined,
    orderBalance: item.orderBalance ?? undefined,
    orderDescription: item.orderDescription ?? undefined,
    validation: item.validation ?? undefined,
    attachments: item.attachments.map((file) => ({
      id: file.id,
      tag: ATTACHMENT_TAG[file.kind] ?? 'PDF',
      name: file.fileName,
    })),
    history: item.history.map((event) => ({
      title: event.title,
      who: event.actor,
      when: stamp(event.occurredAtUtc),
      kind: event.kind.toLowerCase() as HistoryEventKind,
      note: event.note ?? undefined,
    })),
  };
}

export function toPurchaseOrder(dto: PurchaseOrderResponseDto): PurchaseOrder {
  return {
    number: dto.number,
    type: fromApiOrderType(dto.orderType) ?? 'Servicio',
    description: dto.description,
    balance: dto.balance,
  };
}

/** Multipart del registro Con OC / Sin OC. */
export function toRegistrationForm(command: RegisterElectronicDocumentCommand): FormData {
  const form = new FormData();
  form.append(
    'EntryType',
    command.entryType === 'Con OC' ? 'WithPurchaseOrder' : 'WithoutPurchaseOrder',
  );
  form.append('CompanyCode', command.companyCode);
  if (command.isPettyCash) form.append('IsPettyCash', 'true');
  if (command.order) {
    form.append('OrderType', toApiOrderType(command.order.type));
    form.append('OrderNumber', command.order.number);
  }
  if (command.approverId) form.append('ApproverId', command.approverId);
  form.append('Xml', command.xml, command.xml.name);
  form.append('Pdf', command.pdf, command.pdf.name);
  if (command.cdr) form.append('Cdr', command.cdr, command.cdr.name);
  for (const extra of command.extras) form.append('Extras', extra, extra.name);
  return form;
}

/** Multipart del registro de un documento especial. */
export function toSpecialRegistrationForm(command: RegisterSpecialDocumentCommand): FormData {
  const data = new FormData();
  data.append('CompanyCode', command.companyCode);
  data.append('DocumentType', SPECIAL_TYPE_CODES[command.type]);
  data.append('ProviderRuc', command.providerRuc);
  data.append('IssuedAt', command.issuedAt);
  data.append('Number', command.number);
  data.append('Amount', String(command.amount));
  data.append('Currency', command.currency);
  data.append('Pdf', command.pdf, command.pdf.name);
  return data;
}

import { ApiDocumentStatus } from './api-document-status';
import { ApiEntryType } from './api-entry-type';

export interface DocumentDetailResponseDto {
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
  status: ApiDocumentStatus;
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

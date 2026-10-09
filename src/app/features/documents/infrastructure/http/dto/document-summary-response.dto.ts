import { ApiDocumentStatus } from './api-document-status';
import { ApiEntryType } from './api-entry-type';

export interface DocumentSummaryResponseDto {
  id: string;
  number: string;
  entryType: ApiEntryType;
  documentType: string;
  providerRuc: string;
  providerName: string;
  currency: 'PEN' | 'USD';
  amount: number;
  status: ApiDocumentStatus;
  isPettyCash: boolean;
  issuedAt: string;
  registeredAtUtc: string;
  approverName: string | null;
  orderNumber: string | null;
}

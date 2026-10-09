import { InjectionToken } from '@angular/core';
import { ApproveDocumentPort } from '../application/ports/in/approve-document.port';
import { DownloadAttachmentPort } from '../application/ports/in/download-attachment.port';
import { GetDocumentPort } from '../application/ports/in/get-document.port';
import { ObserveDocumentPort } from '../application/ports/in/observe-document.port';
import { ReadElectronicDocumentPort } from '../application/ports/in/read-electronic-document.port';
import { ReassignDocumentPort } from '../application/ports/in/reassign-document.port';
import { RegisterElectronicDocumentPort } from '../application/ports/in/register-electronic-document.port';
import { RegisterSpecialDocumentPort } from '../application/ports/in/register-special-document.port';
import { RejectDocumentPort } from '../application/ports/in/reject-document.port';
import { SearchDocumentInboxPort } from '../application/ports/in/search-document-inbox.port';
import { ValidatePurchaseOrderPort } from '../application/ports/in/validate-purchase-order.port';
import { DocumentAccountingPort } from '../application/ports/out/document-accounting.port';
import { DocumentApprovalPort } from '../application/ports/out/document-approval.port';
import { DocumentQueryPort } from '../application/ports/out/document-query.port';
import { DocumentRegistrationPort } from '../application/ports/out/document-registration.port';
import { ElectronicDocumentReaderPort } from '../application/ports/out/electronic-document-reader.port';
import { PurchaseOrderValidatorPort } from '../application/ports/out/purchase-order-validator.port';

// Puertos de entrada
export const SEARCH_DOCUMENT_INBOX = new InjectionToken<SearchDocumentInboxPort>(
  'SEARCH_DOCUMENT_INBOX',
);
export const GET_DOCUMENT = new InjectionToken<GetDocumentPort>('GET_DOCUMENT');
export const DOWNLOAD_ATTACHMENT = new InjectionToken<DownloadAttachmentPort>(
  'DOWNLOAD_ATTACHMENT',
);
export const APPROVE_DOCUMENT = new InjectionToken<ApproveDocumentPort>('APPROVE_DOCUMENT');
export const REASSIGN_DOCUMENT = new InjectionToken<ReassignDocumentPort>('REASSIGN_DOCUMENT');
export const REJECT_DOCUMENT = new InjectionToken<RejectDocumentPort>('REJECT_DOCUMENT');
export const OBSERVE_DOCUMENT = new InjectionToken<ObserveDocumentPort>('OBSERVE_DOCUMENT');
export const REGISTER_ELECTRONIC_DOCUMENT = new InjectionToken<RegisterElectronicDocumentPort>(
  'REGISTER_ELECTRONIC_DOCUMENT',
);
export const REGISTER_SPECIAL_DOCUMENT = new InjectionToken<RegisterSpecialDocumentPort>(
  'REGISTER_SPECIAL_DOCUMENT',
);
export const VALIDATE_PURCHASE_ORDER = new InjectionToken<ValidatePurchaseOrderPort>(
  'VALIDATE_PURCHASE_ORDER',
);
export const READ_ELECTRONIC_DOCUMENT = new InjectionToken<ReadElectronicDocumentPort>(
  'READ_ELECTRONIC_DOCUMENT',
);

// Puertos de salida
export const DOCUMENT_QUERY = new InjectionToken<DocumentQueryPort>('DOCUMENT_QUERY');
export const DOCUMENT_APPROVAL = new InjectionToken<DocumentApprovalPort>('DOCUMENT_APPROVAL');
export const DOCUMENT_ACCOUNTING = new InjectionToken<DocumentAccountingPort>(
  'DOCUMENT_ACCOUNTING',
);
export const DOCUMENT_REGISTRATION = new InjectionToken<DocumentRegistrationPort>(
  'DOCUMENT_REGISTRATION',
);
export const PURCHASE_ORDER_VALIDATOR = new InjectionToken<PurchaseOrderValidatorPort>(
  'PURCHASE_ORDER_VALIDATOR',
);
export const ELECTRONIC_DOCUMENT_READER = new InjectionToken<ElectronicDocumentReaderPort>(
  'ELECTRONIC_DOCUMENT_READER',
);

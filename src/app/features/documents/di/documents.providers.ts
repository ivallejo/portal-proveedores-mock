import { Provider, inject } from '@angular/core';
import { ApproveDocumentUseCase } from '../application/use-cases/approve-document.use-case';
import { DownloadAttachmentUseCase } from '../application/use-cases/download-attachment.use-case';
import { GetDocumentUseCase } from '../application/use-cases/get-document.use-case';
import { ObserveDocumentUseCase } from '../application/use-cases/observe-document.use-case';
import { ReadElectronicDocumentUseCase } from '../application/use-cases/read-electronic-document.use-case';
import { ReassignDocumentUseCase } from '../application/use-cases/reassign-document.use-case';
import { RegisterElectronicDocumentUseCase } from '../application/use-cases/register-electronic-document.use-case';
import { RegisterSpecialDocumentUseCase } from '../application/use-cases/register-special-document.use-case';
import { RejectDocumentUseCase } from '../application/use-cases/reject-document.use-case';
import { SearchDocumentInboxUseCase } from '../application/use-cases/search-document-inbox.use-case';
import { ValidatePurchaseOrderUseCase } from '../application/use-cases/validate-purchase-order.use-case';
import { DocumentAccountingHttpAdapter } from '../infrastructure/http/document-accounting-http.adapter';
import { DocumentApprovalHttpAdapter } from '../infrastructure/http/document-approval-http.adapter';
import { DocumentQueryHttpAdapter } from '../infrastructure/http/document-query-http.adapter';
import { DocumentRegistrationHttpAdapter } from '../infrastructure/http/document-registration-http.adapter';
import { PurchaseOrderHttpAdapter } from '../infrastructure/http/purchase-order-http.adapter';
import { UblDocumentReaderAdapter } from '../infrastructure/xml/ubl-document-reader.adapter';
import {
  APPROVE_DOCUMENT,
  DOCUMENT_ACCOUNTING,
  DOCUMENT_APPROVAL,
  DOCUMENT_QUERY,
  DOCUMENT_REGISTRATION,
  DOWNLOAD_ATTACHMENT,
  ELECTRONIC_DOCUMENT_READER,
  GET_DOCUMENT,
  OBSERVE_DOCUMENT,
  PURCHASE_ORDER_VALIDATOR,
  READ_ELECTRONIC_DOCUMENT,
  REASSIGN_DOCUMENT,
  REGISTER_ELECTRONIC_DOCUMENT,
  REGISTER_SPECIAL_DOCUMENT,
  REJECT_DOCUMENT,
  SEARCH_DOCUMENT_INBOX,
  VALIDATE_PURCHASE_ORDER,
} from './documents.tokens';

/** Lo que comparten las dos bandejas: listado, detalle y descarga de adjuntos. */
const INBOX_PROVIDERS: Provider[] = [
  { provide: DOCUMENT_QUERY, useClass: DocumentQueryHttpAdapter },
  {
    provide: SEARCH_DOCUMENT_INBOX,
    useFactory: () => new SearchDocumentInboxUseCase(inject(DOCUMENT_QUERY)),
  },
  { provide: GET_DOCUMENT, useFactory: () => new GetDocumentUseCase(inject(DOCUMENT_QUERY)) },
  {
    provide: DOWNLOAD_ATTACHMENT,
    useFactory: () => new DownloadAttachmentUseCase(inject(DOCUMENT_QUERY)),
  },
];

const REJECTION_PROVIDERS: Provider[] = [
  { provide: DOCUMENT_APPROVAL, useClass: DocumentApprovalHttpAdapter },
  { provide: DOCUMENT_ACCOUNTING, useClass: DocumentAccountingHttpAdapter },
  {
    provide: REJECT_DOCUMENT,
    useFactory: () =>
      new RejectDocumentUseCase(inject(DOCUMENT_APPROVAL), inject(DOCUMENT_ACCOUNTING)),
  },
];

/** Documentos por aprobar: aprobar, reasignar y rechazar. */
export const APPROVALS_PROVIDERS: Provider[] = [
  ...INBOX_PROVIDERS,
  ...REJECTION_PROVIDERS,
  {
    provide: APPROVE_DOCUMENT,
    useFactory: () => new ApproveDocumentUseCase(inject(DOCUMENT_APPROVAL)),
  },
  {
    provide: REASSIGN_DOCUMENT,
    useFactory: () => new ReassignDocumentUseCase(inject(DOCUMENT_APPROVAL)),
  },
];

/** Contabilización: rechazar y observar. */
export const ACCOUNTING_PROVIDERS: Provider[] = [
  ...INBOX_PROVIDERS,
  ...REJECTION_PROVIDERS,
  {
    provide: OBSERVE_DOCUMENT,
    useFactory: () => new ObserveDocumentUseCase(inject(DOCUMENT_ACCOUNTING)),
  },
];

/** Registrar documentos: validación de la orden, lectura del XML y registro. */
export const REGISTRATION_PROVIDERS: Provider[] = [
  { provide: DOCUMENT_REGISTRATION, useClass: DocumentRegistrationHttpAdapter },
  { provide: PURCHASE_ORDER_VALIDATOR, useClass: PurchaseOrderHttpAdapter },
  { provide: ELECTRONIC_DOCUMENT_READER, useClass: UblDocumentReaderAdapter },
  {
    provide: REGISTER_ELECTRONIC_DOCUMENT,
    useFactory: () => new RegisterElectronicDocumentUseCase(inject(DOCUMENT_REGISTRATION)),
  },
  {
    provide: REGISTER_SPECIAL_DOCUMENT,
    useFactory: () => new RegisterSpecialDocumentUseCase(inject(DOCUMENT_REGISTRATION)),
  },
  {
    provide: VALIDATE_PURCHASE_ORDER,
    useFactory: () => new ValidatePurchaseOrderUseCase(inject(PURCHASE_ORDER_VALIDATOR)),
  },
  {
    provide: READ_ELECTRONIC_DOCUMENT,
    useFactory: () => new ReadElectronicDocumentUseCase(inject(ELECTRONIC_DOCUMENT_READER)),
  },
];

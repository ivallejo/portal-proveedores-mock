import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';
import { DocumentInbox } from '../../models/document-inbox';
import { InboxFilter } from '../../models/inbox-filter';

/** Lectura de documentos y sus adjuntos (hoy, `api/documents`). */
export interface DocumentQueryPort {
  search(inbox: DocumentInbox, filter: InboxFilter): Observable<PortalDocument[]>;
  get(id: string): Observable<PortalDocument>;
  downloadAttachment(documentId: string, attachmentId: string): Observable<Blob>;
}

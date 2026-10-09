import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';
import { DocumentInbox } from '../../models/document-inbox';
import { InboxFilter } from '../../models/inbox-filter';

export interface SearchDocumentInboxPort {
  execute(inbox: DocumentInbox, filter: InboxFilter): Observable<PortalDocument[]>;
}

import { Observable } from 'rxjs';
import { PortalDocument } from '../../domain/models/portal-document';
import { DocumentInbox } from '../models/document-inbox';
import { InboxFilter } from '../models/inbox-filter';
import { SearchDocumentInboxPort } from '../ports/in/search-document-inbox.port';
import { DocumentQueryPort } from '../ports/out/document-query.port';

export class SearchDocumentInboxUseCase implements SearchDocumentInboxPort {
  constructor(private readonly query: DocumentQueryPort) {}

  execute(inbox: DocumentInbox, filter: InboxFilter): Observable<PortalDocument[]> {
    return this.query.search(inbox, filter);
  }
}

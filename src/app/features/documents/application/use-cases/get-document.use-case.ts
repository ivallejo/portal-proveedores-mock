import { Observable } from 'rxjs';
import { PortalDocument } from '../../domain/models/portal-document';
import { GetDocumentPort } from '../ports/in/get-document.port';
import { DocumentQueryPort } from '../ports/out/document-query.port';

export class GetDocumentUseCase implements GetDocumentPort {
  constructor(private readonly query: DocumentQueryPort) {}

  execute(id: string): Observable<PortalDocument> {
    return this.query.get(id);
  }
}

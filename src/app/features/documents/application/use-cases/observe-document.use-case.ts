import { Observable } from 'rxjs';
import { PortalDocument } from '../../domain/models/portal-document';
import { ObserveDocumentPort } from '../ports/in/observe-document.port';
import { DocumentAccountingPort } from '../ports/out/document-accounting.port';

export class ObserveDocumentUseCase implements ObserveDocumentPort {
  constructor(private readonly accounting: DocumentAccountingPort) {}

  execute(id: string, reason: string, email: string): Observable<PortalDocument> {
    return this.accounting.observe(id, reason, email);
  }
}

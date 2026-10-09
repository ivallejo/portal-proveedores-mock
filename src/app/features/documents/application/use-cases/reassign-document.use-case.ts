import { Observable } from 'rxjs';
import { PortalDocument } from '../../domain/models/portal-document';
import { ReassignDocumentPort } from '../ports/in/reassign-document.port';
import { DocumentApprovalPort } from '../ports/out/document-approval.port';

export class ReassignDocumentUseCase implements ReassignDocumentPort {
  constructor(private readonly approval: DocumentApprovalPort) {}

  execute(id: string, approverId: string, reason: string): Observable<PortalDocument> {
    return this.approval.reassign(id, approverId, reason);
  }
}

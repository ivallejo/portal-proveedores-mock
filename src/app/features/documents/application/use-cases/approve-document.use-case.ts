import { Observable } from 'rxjs';
import { ApprovalReferenceType } from '../../domain/models/approval-reference-type';
import { PortalDocument } from '../../domain/models/portal-document';
import { ApproveDocumentPort } from '../ports/in/approve-document.port';
import { DocumentApprovalPort } from '../ports/out/document-approval.port';

export class ApproveDocumentUseCase implements ApproveDocumentPort {
  constructor(private readonly approval: DocumentApprovalPort) {}

  execute(
    id: string,
    referenceType: ApprovalReferenceType,
    reference: string,
  ): Observable<PortalDocument> {
    return this.approval.approve(id, referenceType, reference);
  }
}

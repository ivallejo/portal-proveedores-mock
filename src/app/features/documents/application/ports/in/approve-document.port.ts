import { Observable } from 'rxjs';
import { ApprovalReferenceType } from '../../../domain/models/approval-reference-type';
import { PortalDocument } from '../../../domain/models/portal-document';

export interface ApproveDocumentPort {
  execute(
    id: string,
    referenceType: ApprovalReferenceType,
    reference: string,
  ): Observable<PortalDocument>;
}

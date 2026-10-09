import { Observable } from 'rxjs';
import { ApprovalReferenceType } from '../../../domain/models/approval-reference-type';
import { PortalDocument } from '../../../domain/models/portal-document';

/** Acciones del aprobador. Cada una devuelve el documento actualizado. */
export interface DocumentApprovalPort {
  approve(
    id: string,
    referenceType: ApprovalReferenceType,
    reference: string,
  ): Observable<PortalDocument>;
  reassign(id: string, approverId: string, reason: string): Observable<PortalDocument>;
  reject(id: string, reason: string): Observable<PortalDocument>;
}

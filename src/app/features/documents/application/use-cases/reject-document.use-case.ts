import { Observable } from 'rxjs';
import { PortalDocument } from '../../domain/models/portal-document';
import { RejectionStage } from '../../domain/models/rejection-stage';
import { RejectDocumentPort } from '../ports/in/reject-document.port';
import { DocumentAccountingPort } from '../ports/out/document-accounting.port';
import { DocumentApprovalPort } from '../ports/out/document-approval.port';

/** El rechazo lo hace el aprobador o Cuentas por pagar; cada uno por su propio puerto. */
export class RejectDocumentUseCase implements RejectDocumentPort {
  constructor(
    private readonly approval: DocumentApprovalPort,
    private readonly accounting: DocumentAccountingPort,
  ) {}

  execute(id: string, reason: string, stage: RejectionStage): Observable<PortalDocument> {
    return stage === 'contabilidad'
      ? this.accounting.reject(id, reason)
      : this.approval.reject(id, reason);
  }
}

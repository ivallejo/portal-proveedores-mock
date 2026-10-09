import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';
import { RejectionStage } from '../../../domain/models/rejection-stage';

export interface RejectDocumentPort {
  execute(id: string, reason: string, stage: RejectionStage): Observable<PortalDocument>;
}

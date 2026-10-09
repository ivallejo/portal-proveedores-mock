import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';

export interface ReassignDocumentPort {
  execute(id: string, approverId: string, reason: string): Observable<PortalDocument>;
}

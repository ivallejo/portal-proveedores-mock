import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';

export interface ObserveDocumentPort {
  execute(id: string, reason: string, email: string): Observable<PortalDocument>;
}

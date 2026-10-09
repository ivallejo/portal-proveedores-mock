import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';

export interface GetDocumentPort {
  execute(id: string): Observable<PortalDocument>;
}

import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';
import { RegisterSpecialDocumentCommand } from '../../models/register-special-document.command';

export interface RegisterSpecialDocumentPort {
  execute(command: RegisterSpecialDocumentCommand): Observable<PortalDocument>;
}

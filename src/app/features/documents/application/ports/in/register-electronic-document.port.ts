import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';
import { RegisterElectronicDocumentCommand } from '../../models/register-electronic-document.command';

export interface RegisterElectronicDocumentPort {
  execute(command: RegisterElectronicDocumentCommand): Observable<PortalDocument>;
}

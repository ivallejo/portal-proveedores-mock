import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';
import { RegisterElectronicDocumentCommand } from '../../models/register-electronic-document.command';
import { RegisterSpecialDocumentCommand } from '../../models/register-special-document.command';

/**
 * Registro de documentos. Si SAP, SUNAT o la validación de duplicidad lo rechazan, el error es
 * `DocumentRejectedError`.
 */
export interface DocumentRegistrationPort {
  register(command: RegisterElectronicDocumentCommand): Observable<PortalDocument>;
  registerSpecial(command: RegisterSpecialDocumentCommand): Observable<PortalDocument>;
}

import { Observable } from 'rxjs';
import { PortalDocument } from '../../domain/models/portal-document';
import { RegisterSpecialDocumentCommand } from '../models/register-special-document.command';
import { RegisterSpecialDocumentPort } from '../ports/in/register-special-document.port';
import { DocumentRegistrationPort } from '../ports/out/document-registration.port';

export class RegisterSpecialDocumentUseCase implements RegisterSpecialDocumentPort {
  constructor(private readonly registration: DocumentRegistrationPort) {}

  execute(command: RegisterSpecialDocumentCommand): Observable<PortalDocument> {
    return this.registration.registerSpecial(command);
  }
}

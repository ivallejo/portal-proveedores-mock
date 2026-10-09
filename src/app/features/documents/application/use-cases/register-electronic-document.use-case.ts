import { Observable } from 'rxjs';
import { PortalDocument } from '../../domain/models/portal-document';
import { RegisterElectronicDocumentCommand } from '../models/register-electronic-document.command';
import { RegisterElectronicDocumentPort } from '../ports/in/register-electronic-document.port';
import { DocumentRegistrationPort } from '../ports/out/document-registration.port';

export class RegisterElectronicDocumentUseCase implements RegisterElectronicDocumentPort {
  constructor(private readonly registration: DocumentRegistrationPort) {}

  execute(command: RegisterElectronicDocumentCommand): Observable<PortalDocument> {
    return this.registration.register(command);
  }
}

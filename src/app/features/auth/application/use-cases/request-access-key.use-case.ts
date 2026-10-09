import { Observable } from 'rxjs';
import { ProviderCandidate } from '../../domain/models/provider-candidate';
import { AccessKeyResult } from '../models/access-key-result';
import { RequestAccessKeyPort } from '../ports/in/request-access-key.port';
import { ProviderDirectoryPort } from '../ports/out/provider-directory.port';

/** Al pedir la clave, el proveedor ya aceptó los términos en la pantalla de registro. */
export class RequestAccessKeyUseCase implements RequestAccessKeyPort {
  constructor(private readonly directory: ProviderDirectoryPort) {}

  execute(provider: ProviderCandidate): Observable<AccessKeyResult> {
    return this.directory.requestAccessKey(provider.ruc, true);
  }
}

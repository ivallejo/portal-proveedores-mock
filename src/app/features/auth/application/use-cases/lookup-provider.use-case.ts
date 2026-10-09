import { Observable } from 'rxjs';
import { ProviderCandidate } from '../../domain/models/provider-candidate';
import { LookupProviderPort } from '../ports/in/lookup-provider.port';
import { ProviderDirectoryPort } from '../ports/out/provider-directory.port';

export class LookupProviderUseCase implements LookupProviderPort {
  constructor(private readonly directory: ProviderDirectoryPort) {}

  execute(ruc: string): Observable<ProviderCandidate> {
    return this.directory.lookup(ruc.replace(/\D/g, ''));
  }
}

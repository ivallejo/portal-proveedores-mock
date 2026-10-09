import { Observable } from 'rxjs';
import { ProviderCandidate } from '../../../domain/models/provider-candidate';

export interface LookupProviderPort {
  execute(ruc: string): Observable<ProviderCandidate>;
}

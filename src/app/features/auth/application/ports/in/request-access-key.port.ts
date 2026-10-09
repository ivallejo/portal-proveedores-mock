import { Observable } from 'rxjs';
import { AccessKeyResult } from '../../models/access-key-result';
import { ProviderCandidate } from '../../../domain/models/provider-candidate';

/** Crea o actualiza la cuenta del proveedor y le envía el enlace de activación. */
export interface RequestAccessKeyPort {
  execute(provider: ProviderCandidate): Observable<AccessKeyResult>;
}

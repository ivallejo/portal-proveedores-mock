import { Observable } from 'rxjs';
import { ProviderCandidate } from '../../../domain/models/provider-candidate';
import { AccessKeyResult } from '../../models/access-key-result';

/** Registro online de proveedores contra SAP (hoy, `api/auth/validate-ruc` y `request-access-key`). */
export interface ProviderDirectoryPort {
  /** Falla con `ProviderLookupError` si el RUC no se puede registrar. */
  lookup(ruc: string): Observable<ProviderCandidate>;
  requestAccessKey(ruc: string, termsAccepted: boolean): Observable<AccessKeyResult>;
}

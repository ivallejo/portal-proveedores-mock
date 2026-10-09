import { HttpErrorResponse } from '@angular/common/http';
import { AccessKeyResult } from '../../application/models/access-key-result';
import { ProviderLookupError } from '../../domain/errors/provider-lookup.error';
import { ProviderCandidate } from '../../domain/models/provider-candidate';
import { AccessKeyResponseDto } from '../http/dto/access-key-response.dto';
import { ProviderLookupResponseDto } from '../http/dto/provider-lookup-response.dto';

export function toProviderCandidate(dto: ProviderLookupResponseDto): ProviderCandidate {
  return { ruc: dto.ruc, companyName: dto.companyName, email: dto.maskedEmail };
}

export function toAccessKeyResult(dto: AccessKeyResponseDto): AccessKeyResult {
  return { sent: dto.sent, email: dto.maskedEmail };
}

/** Código del backend cuando el RUC es de un proveedor pero no tiene correo en SAP. */
const PROVIDER_EMAIL_MISSING = 'PROVIDER_EMAIL_MISSING';

/**
 * 409: ya tiene cuenta; 400 con `PROVIDER_EMAIL_MISSING`: sin correo en SAP; 400 con mensaje: falta otro dato en SAP;
 * sin conexión o 5xx: servicio caído; lo demás: no existe.
 */
export function toProviderLookupError(error: unknown): ProviderLookupError {
  const status = error instanceof HttpErrorResponse ? error.status : undefined;
  const body = error instanceof HttpErrorResponse ? error.error : null;
  const message: string = body?.message || '';
  if (status === 409) return new ProviderLookupError('already-registered', message);
  if (status === 400 && body?.code === PROVIDER_EMAIL_MISSING)
    return new ProviderLookupError('missing-email', message);
  if (status === 400 && message) return new ProviderLookupError('cannot-register', message);
  if (status === 0 || (status ?? 0) >= 500) return new ProviderLookupError('unavailable');
  return new ProviderLookupError('not-found');
}

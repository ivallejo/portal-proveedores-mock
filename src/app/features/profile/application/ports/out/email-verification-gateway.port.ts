import { Observable } from 'rxjs';
import { VerifiedEmail } from '../../../domain/models/verified-email';

/** Confirma un correo con el token del enlace; no requiere sesión. */
export interface EmailVerificationGatewayPort {
  verify(token: string): Observable<VerifiedEmail>;
}

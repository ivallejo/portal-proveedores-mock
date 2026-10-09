import { Observable } from 'rxjs';
import { PasswordLinkSent } from '../../models/password-link-sent';

/** Envía el enlace de activación (si la cuenta no se activó) o de recuperación. */
export interface SendPasswordLinkPort {
  execute(userId: string): Observable<PasswordLinkSent>;
}

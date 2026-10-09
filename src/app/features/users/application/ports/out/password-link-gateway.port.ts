import { Observable } from 'rxjs';
import { PasswordLink } from '../../../domain/models/password-link';
import { PasswordLinkSent } from '../../models/password-link-sent';

/** Enlaces de activación o recuperación que el administrador envía a un usuario. */
export interface PasswordLinkGatewayPort {
  send(userId: string): Observable<PasswordLinkSent>;
  history(userId: string): Observable<PasswordLink[]>;
}

import { Observable } from 'rxjs';
import { AuthSession } from '../../models/auth-session';
import { ChangePasswordCommand } from '../../models/change-password.command';
import { ConfirmPasswordLinkCommand } from '../../models/confirm-password-link.command';
import { LoginCommand } from '../../models/login.command';
import { PasswordResetResult } from '../../models/password-reset-result';

/** Autenticación en el backend (hoy, `api/auth`). */
export interface AuthenticationGatewayPort {
  login(command: LoginCommand): Observable<AuthSession>;
  changePassword(command: ChangePasswordCommand): Observable<AuthSession>;
  /** Token nuevo para la misma sesión (falla con 401 si la sesión ya no se puede renovar). */
  renewSession(): Observable<AuthSession>;
  requestPasswordReset(identifier: string): Observable<PasswordResetResult>;
  confirmPasswordLink(command: ConfirmPasswordLinkCommand): Observable<void>;
}

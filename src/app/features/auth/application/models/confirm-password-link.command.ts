import { PasswordLinkAccount } from '../../domain/models/password-link-account';
import { PasswordLinkPurpose } from '../../domain/models/password-link-purpose';

/** Contraseña nueva desde un enlace de activación o de recuperación. */
export interface ConfirmPasswordLinkCommand {
  account: PasswordLinkAccount;
  token: string;
  newPassword: string;
  purpose: PasswordLinkPurpose;
}

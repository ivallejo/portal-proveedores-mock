import { PasswordLinkKind } from './password-link-kind';
import { PasswordLinkStatus } from './password-link-status';

/** Enlace de contraseña enviado a un usuario (solo su huella; el token nunca se muestra). */
export interface PasswordLink {
  kind: PasswordLinkKind;
  fingerprint: string;
  createdAtUtc: string;
  expiresAtUtc: string;
  status: PasswordLinkStatus;
}

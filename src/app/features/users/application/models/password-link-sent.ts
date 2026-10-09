import { PasswordLinkKind } from '../../domain/models/password-link-kind';

/** Enlace enviado y a qué correo. */
export interface PasswordLinkSent {
  kind: PasswordLinkKind;
  email: string;
}

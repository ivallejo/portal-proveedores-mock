/** Cuerpo de `activation/confirm` y `password-reset/confirm`: la cuenta va como `ruc` o `user`. */
export interface ConfirmPasswordLinkRequestDto {
  ruc?: string;
  user?: string;
  token: string;
  newPassword: string;
}

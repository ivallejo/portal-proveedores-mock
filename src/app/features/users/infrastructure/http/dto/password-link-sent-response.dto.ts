/** Respuesta de `POST api/admin/users/{id}/password-link`. */
export interface PasswordLinkSentResponseDto {
  kind: 'activation' | 'reset';
  email: string;
}

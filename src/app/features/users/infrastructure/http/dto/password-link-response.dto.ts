/** Fila de `GET api/admin/users/{id}/password-links`. */
export interface PasswordLinkResponseDto {
  kind: 'activation' | 'reset';
  fingerprint: string;
  createdAtUtc: string;
  expiresAtUtc: string;
  status: 'valid' | 'used' | 'replaced' | 'expired';
}

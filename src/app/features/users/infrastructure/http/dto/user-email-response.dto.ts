/** Correo dentro del detalle de un usuario. */
export interface UserEmailResponseDto {
  id: string | null;
  email: string;
  type: 'work' | 'billing' | 'personal';
  isPrimary: boolean;
  isVerified: boolean;
  createdAtUtc: string | null;
}

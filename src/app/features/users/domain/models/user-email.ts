import { UserEmailType } from './user-email-type';

/** Correo de un usuario; `id` nulo mientras es nuevo y no se ha guardado. */
export interface UserEmail {
  id: string | null;
  email: string;
  type: UserEmailType;
  isPrimary: boolean;
  isVerified: boolean;
  createdAtUtc: string | null;
}

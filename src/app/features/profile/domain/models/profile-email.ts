import { ProfileEmailType } from './profile-email-type';

/** Correo del usuario; solo uno es el principal. */
export interface ProfileEmail {
  id: string;
  email: string;
  type: ProfileEmailType;
  isPrimary: boolean;
  isVerified: boolean;
  createdAtUtc: string;
}

import { UserEmailType } from '../../domain/models/user-email-type';

/** Correo al guardar un usuario: sin `id` si es nuevo. */
export interface SaveUserEmail {
  id?: string;
  email: string;
  type: UserEmailType;
  isPrimary: boolean;
}

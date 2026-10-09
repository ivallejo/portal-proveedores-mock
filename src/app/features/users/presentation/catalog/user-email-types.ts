import { UserEmailType } from '../../domain/models/user-email-type';

/** Tipos de correo y su etiqueta. */
export const USER_EMAIL_TYPES: { value: UserEmailType; label: string }[] = [
  { value: 'work', label: 'Trabajo' },
  { value: 'billing', label: 'Facturación' },
  { value: 'personal', label: 'Personal' },
];

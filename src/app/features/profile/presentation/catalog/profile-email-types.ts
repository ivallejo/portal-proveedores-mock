import { ProfileEmailType } from '../../domain/models/profile-email-type';

/** Tipos de correo y su etiqueta. */
export const PROFILE_EMAIL_TYPES: { value: ProfileEmailType; label: string }[] = [
  { value: 'work', label: 'Trabajo' },
  { value: 'billing', label: 'Facturación' },
  { value: 'personal', label: 'Personal' },
];

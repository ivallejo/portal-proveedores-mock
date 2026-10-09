import { ProfileTab } from '../facades/profile-tab';

export const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
  { key: 'personal-data', label: 'Datos personales' },
  { key: 'emails', label: 'Mis correos' },
  { key: 'password', label: 'Contraseña' },
];

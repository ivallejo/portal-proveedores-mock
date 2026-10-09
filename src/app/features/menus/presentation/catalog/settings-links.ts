import { SettingsLink } from './settings-link';

/** Pantallas de Configuración y su feature flag. */
export const SETTINGS_LINKS: SettingsLink[] = [
  { label: 'Sociedades', path: '/configuracion/sociedades', feature: 'sociedades' },
  { label: 'Áreas', path: '/configuracion/areas', feature: 'areas' },
  { label: 'Usuarios', path: '/configuracion/usuarios', feature: 'usuarios' },
  { label: 'Roles y permisos', path: '/configuracion/roles', feature: 'roles' },
  { label: 'Menús', path: '/configuracion/menus', feature: 'menus' },
];

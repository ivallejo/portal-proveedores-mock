import { MenuOption } from '../models/menu-option';

/** Opciones que no se pueden desactivar: sin ellas nadie podría administrar roles y menús. */
const PROTECTED = new Set(['SETTINGS', 'SETTINGS_ROLES', 'SETTINGS_MENUS']);

export function isProtectedMenu(menu: MenuOption): boolean {
  return PROTECTED.has(menu.code);
}

/** Rutas en minúsculas y con guiones en lugar de espacios. */
export function normalizeMenuRoute(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '-');
}

/** El orden es un número de 1 a 99. */
export function normalizeMenuOrder(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 2);
}

/** Ruta de una opción: obligatoria en un submenú, con formato `/a/b`, y sin repetirse en otra opción. */
export function menuRouteError(
  route: string,
  isSubmenu: boolean,
  menus: readonly MenuOption[],
  currentId: string | undefined,
): string | undefined {
  if (!route && isSubmenu) return 'Un submenú necesita una ruta.';
  if (route && !/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(route))
    return 'Debe empezar con / y usar minúsculas, números o guiones.';
  if (route && menus.some((menu) => menu.id !== currentId && menu.route === route))
    return 'Esta ruta ya está asignada a otro menú.';
  return undefined;
}

export function menuOrderError(order: number): string | undefined {
  return order >= 1 && order <= 99 ? undefined : 'Ingresa un número entre 1 y 99.';
}

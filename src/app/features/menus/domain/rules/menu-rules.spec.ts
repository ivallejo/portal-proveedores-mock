import { MenuOption } from '../models/menu-option';
import { isProtectedMenu, menuOrderError, menuRouteError, normalizeMenuRoute } from './menu-rules';

const menu = (id: string, route: string | null, code = id): MenuOption => ({
  id,
  code,
  name: id,
  route,
  icon: 'circle',
  order: 1,
  parentId: null,
  isActive: true,
  isSystem: false,
  roleCount: 0,
});

describe('menu rules', () => {
  it('validates the route of an option', () => {
    const menus = [menu('a', '/reportes')];
    expect(menuRouteError('', true, menus, undefined)).toBe('Un submenú necesita una ruta.');
    expect(menuRouteError('', false, menus, undefined)).toBeUndefined();
    expect(menuRouteError('Reportes', false, menus, undefined)).toContain('Debe empezar con /');
    expect(menuRouteError('/reportes', false, menus, undefined)).toBe(
      'Esta ruta ya está asignada a otro menú.',
    );
    expect(menuRouteError('/reportes', false, menus, 'a')).toBeUndefined();
    expect(normalizeMenuRoute('/Mis Reportes')).toBe('/mis-reportes');
  });

  it('keeps the order between 1 and 99 and protects the administration options', () => {
    expect(menuOrderError(0)).toBeDefined();
    expect(menuOrderError(99)).toBeUndefined();
    expect(isProtectedMenu(menu('x', null, 'SETTINGS_MENUS'))).toBeTrue();
    expect(isProtectedMenu(menu('x', null, 'HOME'))).toBeFalse();
  });
});

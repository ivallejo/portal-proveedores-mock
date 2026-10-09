import { AccessRole } from '../models/access-role';
import { PermissionOption } from '../models/permission-option';
import {
  assignedMenuCount,
  permissionTree,
  roleNameError,
  togglePermission,
} from './permission-rules';

const option = (id: string, parentId: string | null = null): PermissionOption => ({
  id,
  code: id.toUpperCase(),
  name: id,
  route: null,
  icon: 'circle',
  parentId,
  isActive: true,
});
const menus = [
  option('home'),
  option('settings'),
  option('users', 'settings'),
  option('roles', 'settings'),
];
const role = (name: string, id = name): AccessRole => ({
  id,
  code: name.toUpperCase(),
  name,
  description: null,
  isActive: true,
  isSystem: false,
  userCount: 0,
  menuIds: ['home', 'gone'],
});

describe('permission rules', () => {
  it('a main menu checks or unchecks all its submenus', () => {
    const all = togglePermission(new Set(), menus[1], menus);
    expect([...all].sort()).toEqual(['roles', 'settings', 'users']);
    expect(togglePermission(all, menus[1], menus).size).toBe(0);
  });

  it('a submenu brings its main menu, and the last one unchecked drops it', () => {
    const one = togglePermission(new Set(), menus[2], menus);
    expect([...one].sort()).toEqual(['settings', 'users']);
    expect(togglePermission(one, menus[2], menus).size).toBe(0);
  });

  it('marks a main menu as mixed when only some submenus are checked', () => {
    const tree = permissionTree(menus, new Set(['settings', 'users']));
    expect(tree.find((node) => node.menu.id === 'settings')).toEqual(
      jasmine.objectContaining({ on: false, mixed: true, isChild: false }),
    );
    expect(tree.find((node) => node.menu.id === 'users')?.on).toBeTrue();
  });

  it('counts only existing options and keeps role names unique', () => {
    expect(assignedMenuCount(role('Compras'), menus)).toBe(1);
    const roles = [role('Compras', 'r1')];
    expect(roleNameError('', roles, null)).toBe('Ingresa el nombre del rol.');
    expect(roleNameError('COMPRAS', roles, null)).toBe('Ya existe un rol con ese nombre.');
    expect(roleNameError('compras', roles, 'r1')).toBeUndefined();
  });
});

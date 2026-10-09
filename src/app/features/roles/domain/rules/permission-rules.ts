import { AccessRole } from '../models/access-role';
import { PermissionOption } from '../models/permission-option';
import { PermissionTreeNode } from '../models/permission-tree-node';

/** Árbol de permisos: menús principales y sus submenús, con su estado de selección. */
export function permissionTree(
  menus: readonly PermissionOption[],
  selected: ReadonlySet<string>,
): PermissionTreeNode[] {
  return menus.map((menu) => {
    const children = menus.filter((child) => child.parentId === menu.id);
    const chosen = children.filter((child) => selected.has(child.id)).length;
    const on = children.length ? chosen === children.length : selected.has(menu.id);
    const mixed = children.length > 0 && chosen > 0 && chosen < children.length;
    return { menu, on, mixed, isChild: menu.parentId !== null };
  });
}

/** Un menú principal marca o desmarca todos sus submenús; un submenú arrastra a su menú principal. */
export function togglePermission(
  selected: ReadonlySet<string>,
  menu: PermissionOption,
  menus: readonly PermissionOption[],
): Set<string> {
  const children = menus.filter((child) => child.parentId === menu.id);
  const next = new Set(selected);
  if (children.length) {
    const all = children.every((child) => next.has(child.id));
    for (const id of [menu.id, ...children.map((child) => child.id)]) {
      if (all) next.delete(id);
      else next.add(id);
    }
  } else {
    if (!next.delete(menu.id)) next.add(menu.id);
    if (menu.parentId) {
      const siblings = menus.filter((child) => child.parentId === menu.parentId);
      if (siblings.some((child) => next.has(child.id))) next.add(menu.parentId);
      else next.delete(menu.parentId);
    }
  }
  return next;
}

/** Cuántas de las opciones existentes tiene el rol. */
export function assignedMenuCount(role: AccessRole, menus: readonly PermissionOption[]): number {
  return role.menuIds.filter((id) => menus.some((menu) => menu.id === id)).length;
}

/** El nombre es obligatorio y no se repite entre roles (sin distinguir mayúsculas). */
export function roleNameError(
  name: string,
  roles: readonly AccessRole[],
  currentId: string | null,
): string | undefined {
  if (!name) return 'Ingresa el nombre del rol.';
  const taken = roles.some(
    (role) => role.name.toLowerCase() === name.toLowerCase() && role.id !== currentId,
  );
  return taken ? 'Ya existe un rol con ese nombre.' : undefined;
}

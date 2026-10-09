/** Opción del menú que se puede asignar a un rol (lo que Roles necesita de la feature menus). */
export interface PermissionOption {
  id: string;
  code: string;
  name: string;
  route: string | null;
  icon: string;
  parentId: string | null;
  isActive: boolean;
}

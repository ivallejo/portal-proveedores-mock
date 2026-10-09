/** Rol del portal con las opciones del menú que tiene asignadas (sus permisos). */
export interface AccessRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  userCount: number;
  menuIds: string[];
}

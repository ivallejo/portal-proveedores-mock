/** Opción del menú en Configuración › Menús (dos niveles: menú principal y submenú). */
export interface MenuOption {
  id: string;
  code: string;
  name: string;
  route: string | null;
  icon: string;
  order: number;
  parentId: string | null;
  isActive: boolean;
  isSystem: boolean;
  roleCount: number;
}

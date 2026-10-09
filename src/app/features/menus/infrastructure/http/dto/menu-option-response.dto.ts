/** Opción de `api/admin/menus`. */
export interface MenuOptionResponseDto {
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

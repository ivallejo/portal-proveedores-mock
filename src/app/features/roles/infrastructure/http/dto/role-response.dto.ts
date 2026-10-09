/** Rol de `api/admin/roles`. */
export interface RoleResponseDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  userCount: number;
  menuIds: string[];
}

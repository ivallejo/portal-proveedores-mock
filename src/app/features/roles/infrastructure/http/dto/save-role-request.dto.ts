/** Cuerpo de `POST` y `PUT api/admin/roles`. */
export interface SaveRoleRequestDto {
  name: string;
  description: string;
  menuIds: string[];
}

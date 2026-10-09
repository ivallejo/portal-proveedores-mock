/** Cuerpo de `POST` y `PUT api/admin/menus`. */
export interface SaveMenuRequestDto {
  name: string;
  route: string | null;
  icon: string;
  order: number;
  parentId: string | null;
}

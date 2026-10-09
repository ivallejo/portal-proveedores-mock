/** Datos de alta o edición de un rol y sus opciones del menú. */
export interface SaveRoleCommand {
  name: string;
  description: string;
  menuIds: string[];
}

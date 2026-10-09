/** Datos de alta o edición de una opción del menú. */
export interface SaveMenuCommand {
  name: string;
  route: string | null;
  icon: string;
  order: number;
  parentId: string | null;
}

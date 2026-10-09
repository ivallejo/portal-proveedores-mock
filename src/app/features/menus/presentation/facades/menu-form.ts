/** Formulario de una opción del menú, tal como se edita (el orden se escribe como texto). */
export interface MenuForm {
  name: string;
  route: string;
  icon: string;
  order: string;
  parentId: string;
  isActive: boolean;
}

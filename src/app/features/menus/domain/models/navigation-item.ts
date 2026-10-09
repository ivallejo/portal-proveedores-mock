/** Opción del menú lateral de la sesión (Configuración › Roles y permisos define cuáles ve cada rol). */
export interface NavigationItem {
  code: string;
  name: string;
  route: string | null;
  icon: string;
  children: NavigationItem[];
}

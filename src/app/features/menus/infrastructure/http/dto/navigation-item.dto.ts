/** Opción de `api/navigation`. */
export interface NavigationItemDto {
  code: string;
  name: string;
  route: string | null;
  icon: string;
  children: NavigationItemDto[];
}

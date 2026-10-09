/** Sociedad que se puede asignar a un usuario. */
export interface CatalogCompany {
  code: string;
  name: string;
  ruc: string | null;
  isActive: boolean;
}

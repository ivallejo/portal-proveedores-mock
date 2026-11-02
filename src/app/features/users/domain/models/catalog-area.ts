/** Área que se puede asignar al personal interno, con las sociedades en las que existe. */
export interface CatalogArea {
  id: string;
  name: string;
  companyCodes: string[];
  isActive: boolean;
}

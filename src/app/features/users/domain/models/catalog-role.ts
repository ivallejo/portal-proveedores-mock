/** Rol que se puede asignar a un usuario; `isProvider` separa las cuentas con RUC del personal interno. */
export interface CatalogRole {
  code: string;
  name: string;
  description: string | null;
  isProvider: boolean;
  isActive: boolean;
}

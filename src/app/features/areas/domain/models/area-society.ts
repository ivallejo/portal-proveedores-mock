/** Sociedad a la que puede pertenecer un área (lo que Áreas necesita de la feature societies). */
export interface AreaSociety {
  id: string;
  code: string;
  name: string;
  ruc: string | null;
  isActive: boolean;
}

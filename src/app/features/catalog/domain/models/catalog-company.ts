/** Sociedad con la que trabaja el usuario. */
export interface CatalogCompany {
  code: string;
  name: string;
  ruc: string | null;
  /** Correo donde la sociedad recibe los comprobantes electrónicos. */
  billingEmail: string | null;
}

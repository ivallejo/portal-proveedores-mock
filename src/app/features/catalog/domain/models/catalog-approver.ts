/** Aprobador de un área. */
export interface CatalogApprover {
  id: string;
  name: string;
  email: string;
  /** Sociedades en las que aprueba. */
  companyCodes: string[];
}

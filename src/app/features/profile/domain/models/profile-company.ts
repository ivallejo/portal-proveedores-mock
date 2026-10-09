/** Sociedad a la que el usuario tiene acceso. */
export interface ProfileCompany {
  code: string;
  name: string;
  ruc: string | null;
  isActive: boolean;
}

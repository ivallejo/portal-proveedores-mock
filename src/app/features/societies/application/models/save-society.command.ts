/** Datos de alta o edición de una sociedad. */
export interface SaveSocietyCommand {
  code: string;
  name: string;
  ruc: string;
  billingEmail: string;
}

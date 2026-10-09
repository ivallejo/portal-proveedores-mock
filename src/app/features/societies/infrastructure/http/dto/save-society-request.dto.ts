/** Cuerpo de `POST` y `PUT api/admin/companies`. */
export interface SaveSocietyRequestDto {
  code: string;
  name: string;
  ruc: string;
  billingEmail: string;
}

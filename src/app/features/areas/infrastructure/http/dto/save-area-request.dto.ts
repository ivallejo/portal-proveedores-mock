/** Cuerpo de `POST` y `PUT api/admin/areas`. */
export interface SaveAreaRequestDto {
  companyId: string;
  name: string;
  description: string;
}

/** Cuerpo de `POST` y `PUT api/admin/areas`. */
export interface SaveAreaRequestDto {
  companyIds: string[];
  name: string;
  description: string;
}

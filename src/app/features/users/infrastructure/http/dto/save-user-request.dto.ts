/** Cuerpo de `POST` y `PUT api/admin/users`. */
export interface SaveUserRequestDto {
  role: string;
  document?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  areaId: string | null;
  companyCodes: string[];
  emails: { id?: string; email: string; type: string; isPrimary: boolean }[];
  status: string;
  mustChangePassword: boolean;
}

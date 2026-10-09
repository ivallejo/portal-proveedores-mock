/** Sociedad tal como la devuelve `api/admin/companies`. */
export interface SocietyResponseDto {
  id: string;
  code: string;
  name: string;
  ruc: string | null;
  billingEmail: string | null;
  isActive: boolean;
  areaCount: number;
  userCount: number;
}

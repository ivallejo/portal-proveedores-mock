/** Área tal como la devuelve `api/admin/areas`. */
export interface AreaResponseDto {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  companyCode: string;
  companyName: string;
  isActive: boolean;
  userCount: number;
}

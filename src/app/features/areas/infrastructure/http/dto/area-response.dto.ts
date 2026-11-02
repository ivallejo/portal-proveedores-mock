/** Área tal como la devuelve `api/admin/areas`. */
export interface AreaResponseDto {
  id: string;
  name: string;
  description: string | null;
  companies: { id: string; code: string; name: string; isActive: boolean }[];
  isActive: boolean;
  userCount: number;
}

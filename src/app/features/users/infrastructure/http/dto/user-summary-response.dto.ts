/** Fila de `GET api/admin/users`. */
export interface UserSummaryResponseDto {
  id: string;
  displayName: string;
  primaryEmail: string;
  isProvider: boolean;
  document: string;
  documentType: 'RUC' | 'DNI' | 'Usuario';
  role: string | null;
  roleName: string | null;
  areaName: string | null;
  companyCodes: string[];
  status: 'active' | 'inactive' | 'locked';
  isActivated: boolean;
}

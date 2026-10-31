/** Fila de `GET api/admin/users`. */
export interface UserSummaryResponseDto {
  id: string;
  username: string;
  displayName: string;
  primaryEmail: string;
  isProvider: boolean;
  document: string;
  documentType: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE' | 'Usuario';
  role: string | null;
  roleName: string | null;
  areaName: string | null;
  companyCodes: string[];
  status: 'active' | 'inactive' | 'locked';
  isActivated: boolean;
}

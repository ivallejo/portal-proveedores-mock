import { UserEmailResponseDto } from './user-email-response.dto';

/** `GET api/admin/users/{id}` y respuesta de alta y edición. */
export interface UserDetailResponseDto {
  id: string;
  username: string;
  isProvider: boolean;
  document: string;
  documentType: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE' | 'Usuario';
  displayName: string;
  businessName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  areaId: string | null;
  companyCodes: string[];
  emails: UserEmailResponseDto[];
  status: 'active' | 'inactive' | 'locked';
  isActivated: boolean;
  mustChangePassword: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  /** Falso si algún correo de la operación (activación, verificación, cambio de usuario) no se pudo enviar. */
  emailsSent?: boolean;
}

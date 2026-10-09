import { UserStatus } from '../../domain/models/user-status';

/** Datos del usuario en el formulario (los correos y las sociedades se editan aparte). */
export interface UserForm {
  role: string;
  document: string;
  businessName: string;
  firstName: string;
  lastName: string;
  areaId: string;
  status: UserStatus;
  mustChangePassword: boolean;
}

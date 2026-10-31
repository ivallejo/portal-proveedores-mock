import { IdentityDocumentType } from '../../domain/models/identity-document-type';
import { UserStatus } from '../../domain/models/user-status';

/** Datos del usuario en el formulario (los correos y las sociedades se editan aparte). */
export interface UserForm {
  role: string;
  /** Solo personal interno (el proveedor usa su RUC). */
  documentType: IdentityDocumentType;
  document: string;
  username: string;
  businessName: string;
  firstName: string;
  lastName: string;
  areaId: string;
  status: UserStatus;
  mustChangePassword: boolean;
}

import { IdentityDocumentType } from '../../domain/models/identity-document-type';
import { UserStatus } from '../../domain/models/user-status';
import { SaveUserEmail } from './save-user-email';

/**
 * Alta o edición de un usuario. El documento solo se envía al crear; el usuario, solo para el personal interno (el del
 * proveedor es su RUC).
 */
export interface SaveUserCommand {
  role: string;
  documentType?: IdentityDocumentType;
  document?: string;
  username?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  areaId: string | null;
  companyCodes: string[];
  emails: SaveUserEmail[];
  status: UserStatus;
  mustChangePassword: boolean;
}

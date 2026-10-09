import { UserStatus } from '../../domain/models/user-status';
import { SaveUserEmail } from './save-user-email';

/** Alta o edición de un usuario. El documento solo se envía al crear; proveedor o interno según el rol. */
export interface SaveUserCommand {
  role: string;
  document?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  areaId: string | null;
  companyCodes: string[];
  emails: SaveUserEmail[];
  status: UserStatus;
  mustChangePassword: boolean;
}

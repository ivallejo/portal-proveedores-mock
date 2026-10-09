import { UserDocumentType } from './user-document-type';
import { UserEmail } from './user-email';
import { UserStatus } from './user-status';

/** Usuario completo para editarlo: identidad, rol, área, sociedades, correos y seguridad. */
export interface UserDetail {
  id: string;
  username: string;
  isProvider: boolean;
  document: string;
  documentType: UserDocumentType;
  displayName: string;
  businessName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  areaId: string | null;
  companyCodes: string[];
  emails: UserEmail[];
  status: UserStatus;
  isActivated: boolean;
  mustChangePassword: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

import { UserDocumentType } from './user-document-type';
import { UserStatus } from './user-status';

/** Fila del listado de usuarios. */
export interface UserSummary {
  id: string;
  displayName: string;
  primaryEmail: string;
  isProvider: boolean;
  document: string;
  documentType: UserDocumentType;
  role: string | null;
  roleName: string | null;
  areaName: string | null;
  companyCodes: string[];
  status: UserStatus;
  isActivated: boolean;
}

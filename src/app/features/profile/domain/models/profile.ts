import { ProfileCompany } from './profile-company';
import { ProfileEmail } from './profile-email';

/** Perfil del usuario con sesión: identidad, rol, área, sociedades y correos. */
export interface Profile {
  username: string;
  isProvider: boolean;
  ruc: string | null;
  /** RUC, DNI, CE o PASAPORTE; «Usuario» si una cuenta interna antigua no tiene documento. */
  documentType: string;
  document: string;
  displayName: string;
  businessName: string | null;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  areaName: string | null;
  areaCompanyName: string | null;
  companies: ProfileCompany[];
  emails: ProfileEmail[];
  mustChangePassword: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  passwordSetAtUtc: string | null;
}

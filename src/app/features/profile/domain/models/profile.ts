import { ProfileCompany } from './profile-company';
import { ProfileEmail } from './profile-email';

/** Perfil del usuario con sesión: identidad, rol, área, sociedades y correos. */
export interface Profile {
  username: string;
  isProvider: boolean;
  ruc: string | null;
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

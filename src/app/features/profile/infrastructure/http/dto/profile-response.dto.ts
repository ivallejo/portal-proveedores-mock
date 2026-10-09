import { ProfileCompanyResponseDto } from './profile-company-response.dto';
import { ProfileEmailResponseDto } from './profile-email-response.dto';

/** Respuesta de `api/profile`. */
export interface ProfileResponseDto {
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
  companies: ProfileCompanyResponseDto[];
  emails: ProfileEmailResponseDto[];
  mustChangePassword: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  passwordSetAtUtc: string | null;
}

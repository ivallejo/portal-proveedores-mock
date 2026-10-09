import { UpdateProfileCommand } from '../../application/models/update-profile.command';
import { Profile } from '../../domain/models/profile';
import { VerifiedEmail } from '../../domain/models/verified-email';
import { ProfileResponseDto } from '../http/dto/profile-response.dto';
import { UpdateProfileRequestDto } from '../http/dto/update-profile-request.dto';
import { VerifiedEmailResponseDto } from '../http/dto/verified-email-response.dto';

export function toProfile(dto: ProfileResponseDto): Profile {
  return {
    ...dto,
    roles: [...dto.roles],
    companies: dto.companies.map((company) => ({ ...company })),
    emails: dto.emails.map((email) => ({ ...email })),
  };
}

export function toUpdateProfileRequest(command: UpdateProfileCommand): UpdateProfileRequestDto {
  return { ...command };
}

export function toVerifiedEmail(dto: VerifiedEmailResponseDto): VerifiedEmail {
  return { email: dto.email };
}

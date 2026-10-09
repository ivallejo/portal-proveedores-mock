import { PasswordLinkSent } from '../../application/models/password-link-sent';
import { SaveUserCommand } from '../../application/models/save-user.command';
import { PasswordLink } from '../../domain/models/password-link';
import { UserCatalog } from '../../domain/models/user-catalog';
import { UserDetail } from '../../domain/models/user-detail';
import { UserEmail } from '../../domain/models/user-email';
import { UserPage } from '../../domain/models/user-page';
import { UserSummary } from '../../domain/models/user-summary';
import { PasswordLinkResponseDto } from '../http/dto/password-link-response.dto';
import { PasswordLinkSentResponseDto } from '../http/dto/password-link-sent-response.dto';
import { SaveUserRequestDto } from '../http/dto/save-user-request.dto';
import { UserCatalogResponseDto } from '../http/dto/user-catalog-response.dto';
import { UserDetailResponseDto } from '../http/dto/user-detail-response.dto';
import { UserEmailResponseDto } from '../http/dto/user-email-response.dto';
import { UserPageResponseDto } from '../http/dto/user-page-response.dto';
import { UserSummaryResponseDto } from '../http/dto/user-summary-response.dto';

function toUserSummary(dto: UserSummaryResponseDto): UserSummary {
  return { ...dto, companyCodes: [...dto.companyCodes] };
}

export function toUserPage(dto: UserPageResponseDto): UserPage {
  return { ...dto, items: dto.items.map(toUserSummary), counts: { ...dto.counts } };
}

function toUserEmail(dto: UserEmailResponseDto): UserEmail {
  return { ...dto };
}

export function toUserDetail(dto: UserDetailResponseDto): UserDetail {
  return { ...dto, companyCodes: [...dto.companyCodes], emails: dto.emails.map(toUserEmail) };
}

export function toUserCatalog(dto: UserCatalogResponseDto): UserCatalog {
  return {
    roles: dto.roles.map((role) => ({ ...role })),
    areas: dto.areas.map((area) => ({ ...area })),
    companies: dto.companies.map((company) => ({ ...company })),
  };
}

export function toPasswordLink(dto: PasswordLinkResponseDto): PasswordLink {
  return { ...dto };
}

export function toPasswordLinkSent(dto: PasswordLinkSentResponseDto): PasswordLinkSent {
  return { kind: dto.kind, email: dto.email };
}

export function toSaveUserRequest(command: SaveUserCommand): SaveUserRequestDto {
  return {
    ...command,
    companyCodes: [...command.companyCodes],
    emails: command.emails.map((email) => ({ ...email })),
  };
}

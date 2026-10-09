import { AuthSession } from '../../application/models/auth-session';
import { ConfirmPasswordLinkCommand } from '../../application/models/confirm-password-link.command';
import { Role } from '../../domain/models/role';
import { normalizeRole } from '../../domain/rules/role-rules';
import { AuthResponseDto } from '../http/dto/auth-response.dto';
import { ConfirmPasswordLinkRequestDto } from '../http/dto/confirm-password-link-request.dto';

/** Sesión del frontend a partir de la respuesta del backend (roles con los nombres cortos de `Role`). */
export function toAuthSession(response: AuthResponseDto): AuthSession {
  const names = response.user.roles?.length ? response.user.roles : [response.user.role];
  const roles = Array.from(
    new Set(names.map(normalizeRole).filter((role): role is Role => role !== null)),
  );
  if (!roles.length) roles.push('Proveedor');
  return {
    accessToken: response.accessToken,
    user: {
      username: response.user.username,
      name: response.user.companyName,
      email: response.user.email,
      emails: [response.user.email],
      role: roles[0],
      roles,
      providerId: response.user.ruc || undefined,
      area: response.user.area || undefined,
      mustChangePassword: response.user.mustChangePassword || undefined,
    },
  };
}

export function toConfirmPasswordLinkRequest(
  command: ConfirmPasswordLinkCommand,
): ConfirmPasswordLinkRequestDto {
  return { ...command.account, token: command.token, newPassword: command.newPassword };
}

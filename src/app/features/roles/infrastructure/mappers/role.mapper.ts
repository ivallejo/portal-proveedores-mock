import { SaveRoleCommand } from '../../application/models/save-role.command';
import { AccessRole } from '../../domain/models/access-role';
import { RoleResponseDto } from '../http/dto/role-response.dto';
import { SaveRoleRequestDto } from '../http/dto/save-role-request.dto';

export function toAccessRole(dto: RoleResponseDto): AccessRole {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description,
    isActive: dto.isActive,
    isSystem: dto.isSystem,
    userCount: dto.userCount,
    menuIds: [...dto.menuIds],
  };
}

export function toSaveRoleRequest(command: SaveRoleCommand): SaveRoleRequestDto {
  return { name: command.name, description: command.description, menuIds: [...command.menuIds] };
}

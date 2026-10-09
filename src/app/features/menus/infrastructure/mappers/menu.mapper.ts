import { SaveMenuCommand } from '../../application/models/save-menu.command';
import { MenuOption } from '../../domain/models/menu-option';
import { NavigationItem } from '../../domain/models/navigation-item';
import { MenuOptionResponseDto } from '../http/dto/menu-option-response.dto';
import { NavigationItemDto } from '../http/dto/navigation-item.dto';
import { SaveMenuRequestDto } from '../http/dto/save-menu-request.dto';

export function toNavigationItem(dto: NavigationItemDto): NavigationItem {
  return {
    code: dto.code,
    name: dto.name,
    route: dto.route,
    icon: dto.icon,
    children: dto.children.map(toNavigationItem),
  };
}

export function toMenuOption(dto: MenuOptionResponseDto): MenuOption {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    route: dto.route,
    icon: dto.icon,
    order: dto.order,
    parentId: dto.parentId,
    isActive: dto.isActive,
    isSystem: dto.isSystem,
    roleCount: dto.roleCount,
  };
}

export function toSaveMenuRequest(command: SaveMenuCommand): SaveMenuRequestDto {
  return {
    name: command.name,
    route: command.route,
    icon: command.icon,
    order: command.order,
    parentId: command.parentId,
  };
}

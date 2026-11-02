import { SaveAreaCommand } from '../../application/models/save-area.command';
import { Area } from '../../domain/models/area';
import { AreaResponseDto } from '../http/dto/area-response.dto';
import { SaveAreaRequestDto } from '../http/dto/save-area-request.dto';

export function toArea(dto: AreaResponseDto): Area {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    societies: dto.companies.map((company) => ({ ...company })),
    isActive: dto.isActive,
    userCount: dto.userCount,
  };
}

export function toSaveAreaRequest(command: SaveAreaCommand): SaveAreaRequestDto {
  return {
    companyIds: [...command.societyIds],
    name: command.name,
    description: command.description,
  };
}

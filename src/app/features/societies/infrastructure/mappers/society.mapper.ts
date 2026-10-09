import { SaveSocietyCommand } from '../../application/models/save-society.command';
import { Society } from '../../domain/models/society';
import { SaveSocietyRequestDto } from '../http/dto/save-society-request.dto';
import { SocietyResponseDto } from '../http/dto/society-response.dto';

export function toSociety(dto: SocietyResponseDto): Society {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    ruc: dto.ruc,
    billingEmail: dto.billingEmail,
    isActive: dto.isActive,
    areaCount: dto.areaCount,
    userCount: dto.userCount,
  };
}

export function toSaveSocietyRequest(command: SaveSocietyCommand): SaveSocietyRequestDto {
  return {
    code: command.code,
    name: command.name,
    ruc: command.ruc,
    billingEmail: command.billingEmail,
  };
}

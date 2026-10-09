import { CatalogArea } from '../../domain/models/catalog-area';
import { CatalogCompany } from '../../domain/models/catalog-company';
import { CatalogAreaResponseDto } from '../http/dto/catalog-area-response.dto';
import { CatalogCompanyResponseDto } from '../http/dto/catalog-company-response.dto';

export function toCatalogCompany(dto: CatalogCompanyResponseDto): CatalogCompany {
  return { ...dto };
}

export function toCatalogArea(dto: CatalogAreaResponseDto): CatalogArea {
  return {
    ...dto,
    approvers: dto.approvers.map((approver) => ({
      ...approver,
      companyCodes: [...approver.companyCodes],
    })),
  };
}

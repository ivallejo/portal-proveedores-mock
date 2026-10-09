import { CatalogApproverResponseDto } from './catalog-approver-response.dto';

export interface CatalogAreaResponseDto {
  id: string;
  name: string;
  companyCode: string;
  approvers: CatalogApproverResponseDto[];
}

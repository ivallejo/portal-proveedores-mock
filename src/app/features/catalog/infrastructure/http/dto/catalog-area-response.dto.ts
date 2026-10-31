import { CatalogApproverResponseDto } from './catalog-approver-response.dto';

export interface CatalogAreaResponseDto {
  id: string;
  name: string;
  companyCodes: string[];
  approvers: CatalogApproverResponseDto[];
}

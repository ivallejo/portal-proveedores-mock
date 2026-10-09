import { UserSummaryResponseDto } from './user-summary-response.dto';

/** `GET api/admin/users` (paginado, con contadores). */
export interface UserPageResponseDto {
  items: UserSummaryResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  counts: { total: number; active: number; blockedOrInactive: number };
}

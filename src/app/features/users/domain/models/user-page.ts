import { UserCounts } from './user-counts';
import { UserSummary } from './user-summary';

/** Página del listado de usuarios (el backend pagina y cuenta). */
export interface UserPage {
  items: UserSummary[];
  total: number;
  page: number;
  pageSize: number;
  counts: UserCounts;
}

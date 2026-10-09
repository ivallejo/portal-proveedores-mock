import { UserStatus } from '../../domain/models/user-status';

/** Filtros del listado de usuarios. */
export interface UserFilter {
  search: string;
  role: string;
  status: '' | UserStatus;
}

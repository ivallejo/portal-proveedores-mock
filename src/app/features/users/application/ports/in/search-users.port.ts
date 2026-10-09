import { Observable } from 'rxjs';
import { UserPage } from '../../../domain/models/user-page';
import { UserFilter } from '../../models/user-filter';

export interface SearchUsersPort {
  execute(filter: UserFilter, page: number, pageSize: number): Observable<UserPage>;
}

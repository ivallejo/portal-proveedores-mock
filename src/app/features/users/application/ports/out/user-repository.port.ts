import { Observable } from 'rxjs';
import { UserDetail } from '../../../domain/models/user-detail';
import { UserPage } from '../../../domain/models/user-page';
import { SaveUserCommand } from '../../models/save-user.command';
import { UserFilter } from '../../models/user-filter';

/** Usuarios del portal (hoy, `api/admin/users`). */
export interface UserRepositoryPort {
  search(filter: UserFilter, page: number, pageSize: number): Observable<UserPage>;
  get(id: string): Observable<UserDetail>;
  create(command: SaveUserCommand): Observable<UserDetail>;
  update(id: string, command: SaveUserCommand): Observable<UserDetail>;
  setStatus(id: string, isActive: boolean): Observable<UserDetail>;
}

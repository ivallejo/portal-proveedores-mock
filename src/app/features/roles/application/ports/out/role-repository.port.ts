import { Observable } from 'rxjs';
import { AccessRole } from '../../../domain/models/access-role';
import { SaveRoleCommand } from '../../models/save-role.command';

/** Persistencia de los roles (hoy, `api/admin/roles`). */
export interface RoleRepositoryPort {
  list(): Observable<AccessRole[]>;
  create(command: SaveRoleCommand): Observable<AccessRole>;
  update(id: string, command: SaveRoleCommand): Observable<AccessRole>;
  setStatus(id: string, isActive: boolean): Observable<AccessRole>;
}

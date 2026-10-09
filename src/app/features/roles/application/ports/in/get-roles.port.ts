import { Observable } from 'rxjs';
import { AccessRole } from '../../../domain/models/access-role';

export interface GetRolesPort {
  execute(): Observable<AccessRole[]>;
}

import { Observable } from 'rxjs';
import { AccessRole } from '../../../domain/models/access-role';

export interface ChangeRoleStatusPort {
  execute(id: string, isActive: boolean): Observable<AccessRole>;
}

import { Observable } from 'rxjs';
import { AccessRole } from '../../domain/models/access-role';
import { ChangeRoleStatusPort } from '../ports/in/change-role-status.port';
import { RoleRepositoryPort } from '../ports/out/role-repository.port';

export class ChangeRoleStatusUseCase implements ChangeRoleStatusPort {
  constructor(private readonly repository: RoleRepositoryPort) {}

  execute(id: string, isActive: boolean): Observable<AccessRole> {
    return this.repository.setStatus(id, isActive);
  }
}

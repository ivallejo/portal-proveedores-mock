import { Observable } from 'rxjs';
import { AccessRole } from '../../domain/models/access-role';
import { GetRolesPort } from '../ports/in/get-roles.port';
import { RoleRepositoryPort } from '../ports/out/role-repository.port';

export class GetRolesUseCase implements GetRolesPort {
  constructor(private readonly repository: RoleRepositoryPort) {}

  execute(): Observable<AccessRole[]> {
    return this.repository.list();
  }
}

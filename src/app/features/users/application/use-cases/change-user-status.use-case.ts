import { Observable } from 'rxjs';
import { UserDetail } from '../../domain/models/user-detail';
import { ChangeUserStatusPort } from '../ports/in/change-user-status.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

export class ChangeUserStatusUseCase implements ChangeUserStatusPort {
  constructor(private readonly repository: UserRepositoryPort) {}

  execute(id: string, isActive: boolean): Observable<UserDetail> {
    return this.repository.setStatus(id, isActive);
  }
}

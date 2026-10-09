import { Observable } from 'rxjs';
import { UserDetail } from '../../domain/models/user-detail';
import { SaveUserCommand } from '../models/save-user.command';
import { SaveUserPort } from '../ports/in/save-user.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

export class SaveUserUseCase implements SaveUserPort {
  constructor(private readonly repository: UserRepositoryPort) {}

  execute(id: string | null, command: SaveUserCommand): Observable<UserDetail> {
    return id ? this.repository.update(id, command) : this.repository.create(command);
  }
}

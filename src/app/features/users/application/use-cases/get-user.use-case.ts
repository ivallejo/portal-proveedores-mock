import { Observable } from 'rxjs';
import { UserDetail } from '../../domain/models/user-detail';
import { GetUserPort } from '../ports/in/get-user.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

export class GetUserUseCase implements GetUserPort {
  constructor(private readonly repository: UserRepositoryPort) {}

  execute(id: string): Observable<UserDetail> {
    return this.repository.get(id);
  }
}

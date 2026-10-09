import { Observable } from 'rxjs';
import { UserPage } from '../../domain/models/user-page';
import { UserFilter } from '../models/user-filter';
import { SearchUsersPort } from '../ports/in/search-users.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

export class SearchUsersUseCase implements SearchUsersPort {
  constructor(private readonly repository: UserRepositoryPort) {}

  execute(filter: UserFilter, page: number, pageSize: number): Observable<UserPage> {
    return this.repository.search(filter, page, pageSize);
  }
}

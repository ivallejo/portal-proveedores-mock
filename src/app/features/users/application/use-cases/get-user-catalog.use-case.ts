import { Observable } from 'rxjs';
import { UserCatalog } from '../../domain/models/user-catalog';
import { GetUserCatalogPort } from '../ports/in/get-user-catalog.port';
import { UserCatalogQueryPort } from '../ports/out/user-catalog-query.port';

export class GetUserCatalogUseCase implements GetUserCatalogPort {
  constructor(private readonly catalog: UserCatalogQueryPort) {}

  execute(): Observable<UserCatalog> {
    return this.catalog.catalog();
  }
}

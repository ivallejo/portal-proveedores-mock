import { Observable } from 'rxjs';
import { UserCatalog } from '../../../domain/models/user-catalog';

export interface GetUserCatalogPort {
  execute(): Observable<UserCatalog>;
}

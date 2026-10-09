import { Observable } from 'rxjs';
import { UserCatalog } from '../../../domain/models/user-catalog';

/** Roles, áreas y sociedades que se pueden asignar a un usuario. */
export interface UserCatalogQueryPort {
  catalog(): Observable<UserCatalog>;
}

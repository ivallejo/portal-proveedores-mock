import { Observable } from 'rxjs';
import { PermissionOption } from '../../../domain/models/permission-option';

/** Opciones del menú que se pueden asignar a los roles. */
export interface MenuLookupPort {
  list(): Observable<PermissionOption[]>;
}

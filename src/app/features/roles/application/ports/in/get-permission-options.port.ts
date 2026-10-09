import { Observable } from 'rxjs';
import { PermissionOption } from '../../../domain/models/permission-option';

/** Opciones del menú para el árbol de permisos. */
export interface GetPermissionOptionsPort {
  execute(): Observable<PermissionOption[]>;
}

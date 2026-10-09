import { Observable } from 'rxjs';
import { AccessRole } from '../../../domain/models/access-role';
import { SaveRoleCommand } from '../../models/save-role.command';

/** Crea (`id` nulo) o actualiza un rol y lo deja en el estado pedido. */
export interface SaveRolePort {
  execute(id: string | null, command: SaveRoleCommand, isActive: boolean): Observable<AccessRole>;
}

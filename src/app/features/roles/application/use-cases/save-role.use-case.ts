import { Observable, map, of, switchMap } from 'rxjs';
import { AccessRole } from '../../domain/models/access-role';
import { SaveRoleCommand } from '../models/save-role.command';
import { SaveRolePort } from '../ports/in/save-role.port';
import { RoleRepositoryPort } from '../ports/out/role-repository.port';

/** El backend guarda los datos y el estado por separado: si el estado cambió, se aplica después de guardar. */
export class SaveRoleUseCase implements SaveRolePort {
  constructor(private readonly repository: RoleRepositoryPort) {}

  execute(id: string | null, command: SaveRoleCommand, isActive: boolean): Observable<AccessRole> {
    const save = id ? this.repository.update(id, command) : this.repository.create(command);
    return save.pipe(
      switchMap((saved) =>
        saved.isActive === isActive
          ? of(saved)
          : this.repository.setStatus(saved.id, isActive).pipe(map(() => saved)),
      ),
    );
  }
}

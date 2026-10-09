import { Observable, map, of, switchMap } from 'rxjs';
import { MenuOption } from '../../domain/models/menu-option';
import { SaveMenuCommand } from '../models/save-menu.command';
import { SaveMenuPort } from '../ports/in/save-menu.port';
import { MenuRepositoryPort } from '../ports/out/menu-repository.port';

/** El backend guarda los datos y el estado por separado: si el estado cambió, se aplica después de guardar. */
export class SaveMenuUseCase implements SaveMenuPort {
  constructor(private readonly repository: MenuRepositoryPort) {}

  execute(id: string | null, command: SaveMenuCommand, isActive: boolean): Observable<MenuOption> {
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

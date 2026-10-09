import { Observable } from 'rxjs';
import { MenuOption } from '../../domain/models/menu-option';
import { ChangeMenuStatusPort } from '../ports/in/change-menu-status.port';
import { MenuRepositoryPort } from '../ports/out/menu-repository.port';

export class ChangeMenuStatusUseCase implements ChangeMenuStatusPort {
  constructor(private readonly repository: MenuRepositoryPort) {}

  execute(id: string, isActive: boolean): Observable<MenuOption> {
    return this.repository.setStatus(id, isActive);
  }
}

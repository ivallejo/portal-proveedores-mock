import { Observable } from 'rxjs';
import { MenuOption } from '../../domain/models/menu-option';
import { GetMenusPort } from '../ports/in/get-menus.port';
import { MenuRepositoryPort } from '../ports/out/menu-repository.port';

export class GetMenusUseCase implements GetMenusPort {
  constructor(private readonly repository: MenuRepositoryPort) {}

  execute(): Observable<MenuOption[]> {
    return this.repository.list();
  }
}

import { Observable } from 'rxjs';
import { MenuOption } from '../../../domain/models/menu-option';
import { SaveMenuCommand } from '../../models/save-menu.command';

/** Persistencia de las opciones del menú (hoy, `api/admin/menus`). */
export interface MenuRepositoryPort {
  /** Lista plana: cada menú principal seguido de sus submenús. */
  list(): Observable<MenuOption[]>;
  create(command: SaveMenuCommand): Observable<MenuOption>;
  update(id: string, command: SaveMenuCommand): Observable<MenuOption>;
  setStatus(id: string, isActive: boolean): Observable<MenuOption>;
}

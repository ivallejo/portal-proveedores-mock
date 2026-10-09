import { Observable } from 'rxjs';
import { MenuOption } from '../../../domain/models/menu-option';
import { SaveMenuCommand } from '../../models/save-menu.command';

/** Crea (`id` nulo) o actualiza una opción y la deja en el estado pedido. */
export interface SaveMenuPort {
  execute(id: string | null, command: SaveMenuCommand, isActive: boolean): Observable<MenuOption>;
}

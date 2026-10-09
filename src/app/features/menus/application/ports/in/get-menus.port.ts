import { Observable } from 'rxjs';
import { MenuOption } from '../../../domain/models/menu-option';

/** Todas las opciones del menú, activas e inactivas. */
export interface GetMenusPort {
  execute(): Observable<MenuOption[]>;
}

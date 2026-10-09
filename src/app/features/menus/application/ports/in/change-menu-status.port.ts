import { Observable } from 'rxjs';
import { MenuOption } from '../../../domain/models/menu-option';

export interface ChangeMenuStatusPort {
  execute(id: string, isActive: boolean): Observable<MenuOption>;
}

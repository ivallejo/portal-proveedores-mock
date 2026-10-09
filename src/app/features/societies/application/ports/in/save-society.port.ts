import { Observable } from 'rxjs';
import { Society } from '../../../domain/models/society';
import { SaveSocietyCommand } from '../../models/save-society.command';

/** Crea la sociedad (`id` nulo) o actualiza la existente. */
export interface SaveSocietyPort {
  execute(id: string | null, command: SaveSocietyCommand): Observable<Society>;
}

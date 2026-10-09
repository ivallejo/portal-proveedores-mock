import { Observable } from 'rxjs';
import { Area } from '../../../domain/models/area';
import { SaveAreaCommand } from '../../models/save-area.command';

/** Crea el área (`id` nulo) o actualiza la existente. */
export interface SaveAreaPort {
  execute(id: string | null, command: SaveAreaCommand): Observable<Area>;
}

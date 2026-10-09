import { Observable } from 'rxjs';
import { Area } from '../../../domain/models/area';
import { SaveAreaCommand } from '../../models/save-area.command';

/** Persistencia de las áreas (hoy, `api/admin/areas`). */
export interface AreaRepositoryPort {
  list(): Observable<Area[]>;
  create(command: SaveAreaCommand): Observable<Area>;
  update(id: string, command: SaveAreaCommand): Observable<Area>;
  setStatus(id: string, isActive: boolean): Observable<Area>;
}

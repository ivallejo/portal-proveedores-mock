import { Observable } from 'rxjs';
import { Society } from '../../../domain/models/society';
import { SaveSocietyCommand } from '../../models/save-society.command';

/** Persistencia de las sociedades (hoy, `api/admin/companies`). */
export interface SocietyRepositoryPort {
  list(): Observable<Society[]>;
  create(command: SaveSocietyCommand): Observable<Society>;
  update(id: string, command: SaveSocietyCommand): Observable<Society>;
  setStatus(id: string, isActive: boolean): Observable<Society>;
}

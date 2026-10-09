import { Observable } from 'rxjs';
import { Society } from '../../../domain/models/society';

/** Activa o desactiva una sociedad; no se elimina nada. */
export interface ChangeSocietyStatusPort {
  execute(id: string, isActive: boolean): Observable<Society>;
}

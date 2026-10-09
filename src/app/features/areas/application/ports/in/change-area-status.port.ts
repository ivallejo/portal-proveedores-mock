import { Observable } from 'rxjs';
import { Area } from '../../../domain/models/area';

/** Activa o desactiva un área; no se elimina nada. */
export interface ChangeAreaStatusPort {
  execute(id: string, isActive: boolean): Observable<Area>;
}

import { Observable } from 'rxjs';
import { Area } from '../../../domain/models/area';

/** Todas las áreas (activas e inactivas) con su sociedad y número de usuarios. */
export interface GetAreasPort {
  execute(): Observable<Area[]>;
}

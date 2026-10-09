import { Observable } from 'rxjs';
import { AreaSociety } from '../../../domain/models/area-society';

/** Sociedades para filtrar las áreas y elegir la sociedad de un área. */
export interface GetAreaSocietiesPort {
  execute(): Observable<AreaSociety[]>;
}

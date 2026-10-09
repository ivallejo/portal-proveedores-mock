import { Observable } from 'rxjs';
import { AreaSociety } from '../../../domain/models/area-society';

/** Sociedades del grupo, vistas desde Áreas. */
export interface SocietyLookupPort {
  list(): Observable<AreaSociety[]>;
}

import { Observable } from 'rxjs';
import { Society } from '../../../domain/models/society';

/** Todas las sociedades (activas e inactivas) con sus totales. */
export interface GetSocietiesPort {
  execute(): Observable<Society[]>;
}

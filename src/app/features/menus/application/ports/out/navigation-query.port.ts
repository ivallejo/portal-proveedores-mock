import { Observable } from 'rxjs';
import { NavigationItem } from '../../../domain/models/navigation-item';

/** Menú de quien tiene sesión (hoy, `api/navigation`). */
export interface NavigationQueryPort {
  forCurrentUser(): Observable<NavigationItem[]>;
}

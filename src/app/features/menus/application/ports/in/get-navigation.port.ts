import { Observable } from 'rxjs';
import { NavigationItem } from '../../../domain/models/navigation-item';

export interface GetNavigationPort {
  execute(): Observable<NavigationItem[]>;
}

import { Observable } from 'rxjs';
import { NavigationItem } from '../../domain/models/navigation-item';
import { GetNavigationPort } from '../ports/in/get-navigation.port';
import { NavigationQueryPort } from '../ports/out/navigation-query.port';

export class GetNavigationUseCase implements GetNavigationPort {
  constructor(private readonly navigation: NavigationQueryPort) {}

  execute(): Observable<NavigationItem[]> {
    return this.navigation.forCurrentUser();
  }
}

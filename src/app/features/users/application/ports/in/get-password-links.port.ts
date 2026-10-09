import { Observable } from 'rxjs';
import { PasswordLink } from '../../../domain/models/password-link';

export interface GetPasswordLinksPort {
  execute(userId: string): Observable<PasswordLink[]>;
}

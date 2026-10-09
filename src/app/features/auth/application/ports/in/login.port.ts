import { Observable } from 'rxjs';
import { AuthenticatedUser } from '../../../domain/models/authenticated-user';
import { LoginCommand } from '../../models/login.command';

export interface LoginPort {
  execute(command: LoginCommand): Observable<AuthenticatedUser>;
}

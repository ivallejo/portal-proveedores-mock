import { Observable } from 'rxjs';
import { AuthenticatedUser } from '../../../domain/models/authenticated-user';
import { ChangePasswordCommand } from '../../models/change-password.command';

/** Cambia la contraseña de quien tiene sesión y renueva la sesión. */
export interface ChangePasswordPort {
  execute(command: ChangePasswordCommand): Observable<AuthenticatedUser>;
}

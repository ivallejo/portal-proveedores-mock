import { Observable } from 'rxjs';
import { Profile } from '../../../domain/models/profile';
import { ProfileEmailType } from '../../../domain/models/profile-email-type';
import { UpdateProfileCommand } from '../../models/update-profile.command';

/** Perfil del usuario con sesión (hoy, `api/profile`). Cada operación devuelve el perfil actualizado. */
export interface ProfileRepositoryPort {
  get(): Observable<Profile>;
  update(command: UpdateProfileCommand): Observable<Profile>;
  addEmail(email: string, type: ProfileEmailType): Observable<Profile>;
  resendVerification(emailId: string): Observable<Profile>;
  makePrimary(emailId: string): Observable<Profile>;
  removeEmail(emailId: string): Observable<Profile>;
}

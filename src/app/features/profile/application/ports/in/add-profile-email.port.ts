import { Observable } from 'rxjs';
import { Profile } from '../../../domain/models/profile';
import { ProfileEmailType } from '../../../domain/models/profile-email-type';

export interface AddProfileEmailPort {
  execute(email: string, type: ProfileEmailType): Observable<Profile>;
}

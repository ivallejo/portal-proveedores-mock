import { Observable } from 'rxjs';
import { Profile } from '../../../domain/models/profile';
import { UpdateProfileCommand } from '../../models/update-profile.command';

export interface UpdateProfilePort {
  execute(command: UpdateProfileCommand): Observable<Profile>;
}

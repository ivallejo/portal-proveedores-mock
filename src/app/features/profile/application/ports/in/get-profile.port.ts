import { Observable } from 'rxjs';
import { Profile } from '../../../domain/models/profile';

export interface GetProfilePort {
  execute(): Observable<Profile>;
}

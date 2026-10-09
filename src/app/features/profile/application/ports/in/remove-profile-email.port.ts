import { Observable } from 'rxjs';
import { Profile } from '../../../domain/models/profile';

export interface RemoveProfileEmailPort {
  execute(emailId: string): Observable<Profile>;
}

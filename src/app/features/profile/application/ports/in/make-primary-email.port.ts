import { Observable } from 'rxjs';
import { Profile } from '../../../domain/models/profile';

export interface MakePrimaryEmailPort {
  execute(emailId: string): Observable<Profile>;
}

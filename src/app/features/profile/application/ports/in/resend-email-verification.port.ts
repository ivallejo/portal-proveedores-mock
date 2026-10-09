import { Observable } from 'rxjs';
import { Profile } from '../../../domain/models/profile';

export interface ResendEmailVerificationPort {
  execute(emailId: string): Observable<Profile>;
}

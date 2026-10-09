import { Observable } from 'rxjs';
import { VerifiedEmail } from '../../../domain/models/verified-email';

export interface VerifyEmailPort {
  execute(token: string): Observable<VerifiedEmail>;
}

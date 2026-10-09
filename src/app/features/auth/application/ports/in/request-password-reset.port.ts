import { Observable } from 'rxjs';
import { PasswordResetResult } from '../../models/password-reset-result';

export interface RequestPasswordResetPort {
  execute(ruc: string): Observable<PasswordResetResult>;
}

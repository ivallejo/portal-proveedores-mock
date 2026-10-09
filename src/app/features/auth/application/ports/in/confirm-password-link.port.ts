import { Observable } from 'rxjs';
import { ConfirmPasswordLinkCommand } from '../../models/confirm-password-link.command';

export interface ConfirmPasswordLinkPort {
  execute(command: ConfirmPasswordLinkCommand): Observable<void>;
}

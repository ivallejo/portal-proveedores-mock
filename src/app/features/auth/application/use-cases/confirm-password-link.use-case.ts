import { Observable } from 'rxjs';
import { ConfirmPasswordLinkCommand } from '../models/confirm-password-link.command';
import { ConfirmPasswordLinkPort } from '../ports/in/confirm-password-link.port';
import { AuthenticationGatewayPort } from '../ports/out/authentication-gateway.port';

export class ConfirmPasswordLinkUseCase implements ConfirmPasswordLinkPort {
  constructor(private readonly gateway: AuthenticationGatewayPort) {}

  execute(command: ConfirmPasswordLinkCommand): Observable<void> {
    return this.gateway.confirmPasswordLink(command);
  }
}

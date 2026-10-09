import { Observable } from 'rxjs';
import { PasswordLinkSent } from '../models/password-link-sent';
import { SendPasswordLinkPort } from '../ports/in/send-password-link.port';
import { PasswordLinkGatewayPort } from '../ports/out/password-link-gateway.port';

export class SendPasswordLinkUseCase implements SendPasswordLinkPort {
  constructor(private readonly links: PasswordLinkGatewayPort) {}

  execute(userId: string): Observable<PasswordLinkSent> {
    return this.links.send(userId);
  }
}

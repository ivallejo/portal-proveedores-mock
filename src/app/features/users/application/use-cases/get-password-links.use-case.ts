import { Observable } from 'rxjs';
import { PasswordLink } from '../../domain/models/password-link';
import { GetPasswordLinksPort } from '../ports/in/get-password-links.port';
import { PasswordLinkGatewayPort } from '../ports/out/password-link-gateway.port';

export class GetPasswordLinksUseCase implements GetPasswordLinksPort {
  constructor(private readonly links: PasswordLinkGatewayPort) {}

  execute(userId: string): Observable<PasswordLink[]> {
    return this.links.history(userId);
  }
}

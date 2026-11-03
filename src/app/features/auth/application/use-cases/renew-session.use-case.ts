import { Observable, map } from 'rxjs';
import { RenewSessionPort } from '../ports/in/renew-session.port';
import { AuthenticationGatewayPort } from '../ports/out/authentication-gateway.port';
import { SessionStorePort } from '../ports/out/session-store.port';

export class RenewSessionUseCase implements RenewSessionPort {
  constructor(
    private readonly gateway: AuthenticationGatewayPort,
    private readonly store: SessionStorePort,
  ) {}

  execute(): Observable<void> {
    return this.gateway.renewSession().pipe(map((session) => this.store.save(session)));
  }
}

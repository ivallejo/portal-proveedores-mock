import { Observable, map } from 'rxjs';
import { AuthenticatedUser } from '../../domain/models/authenticated-user';
import { LoginCommand } from '../models/login.command';
import { LoginPort } from '../ports/in/login.port';
import { AuthenticationGatewayPort } from '../ports/out/authentication-gateway.port';
import { SessionListenerPort } from '../ports/out/session-listener.port';
import { SessionStorePort } from '../ports/out/session-store.port';

export class LoginUseCase implements LoginPort {
  constructor(
    private readonly gateway: AuthenticationGatewayPort,
    private readonly store: SessionStorePort,
    private readonly listeners: readonly SessionListenerPort[],
  ) {}

  execute(command: LoginCommand): Observable<AuthenticatedUser> {
    return this.gateway.login(command).pipe(
      map((session) => {
        this.store.save(session);
        this.listeners.forEach((listener) => listener.sessionChanged());
        return session.user;
      }),
    );
  }
}

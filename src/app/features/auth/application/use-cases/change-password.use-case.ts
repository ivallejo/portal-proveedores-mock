import { Observable, map } from 'rxjs';
import { AuthenticatedUser } from '../../domain/models/authenticated-user';
import { ChangePasswordCommand } from '../models/change-password.command';
import { ChangePasswordPort } from '../ports/in/change-password.port';
import { AuthenticationGatewayPort } from '../ports/out/authentication-gateway.port';
import { SessionListenerPort } from '../ports/out/session-listener.port';
import { SessionStorePort } from '../ports/out/session-store.port';

export class ChangePasswordUseCase implements ChangePasswordPort {
  constructor(
    private readonly gateway: AuthenticationGatewayPort,
    private readonly store: SessionStorePort,
    private readonly listeners: readonly SessionListenerPort[],
  ) {}

  execute(command: ChangePasswordCommand): Observable<AuthenticatedUser> {
    return this.gateway.changePassword(command).pipe(
      map((session) => {
        this.store.save(session);
        this.listeners.forEach((listener) => listener.sessionChanged());
        return session.user;
      }),
    );
  }
}

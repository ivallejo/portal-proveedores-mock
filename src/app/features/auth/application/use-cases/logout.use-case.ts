import { LogoutPort } from '../ports/in/logout.port';
import { SessionListenerPort } from '../ports/out/session-listener.port';
import { SessionStorePort } from '../ports/out/session-store.port';

export class LogoutUseCase implements LogoutPort {
  constructor(
    private readonly store: SessionStorePort,
    private readonly listeners: readonly SessionListenerPort[],
  ) {}

  execute(): void {
    this.store.clear();
    this.listeners.forEach((listener) => listener.sessionChanged());
  }
}

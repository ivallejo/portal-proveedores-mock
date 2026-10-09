import { AuthenticatedUser } from '../../domain/models/authenticated-user';
import { RestoreSessionPort } from '../ports/in/restore-session.port';
import { SessionStorePort } from '../ports/out/session-store.port';

export class RestoreSessionUseCase implements RestoreSessionPort {
  constructor(private readonly store: SessionStorePort) {}

  /** Una sesión sin roles no es válida (por ejemplo, guardada por una versión anterior). */
  execute(): AuthenticatedUser | null {
    const user = this.store.load()?.user;
    return Array.isArray(user?.roles) && user.roles.length ? user : null;
  }
}

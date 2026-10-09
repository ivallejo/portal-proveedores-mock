import { AuthenticatedUser } from '../../domain/models/authenticated-user';
import { SessionUserChanges } from '../models/session-user-changes';
import { UpdateSessionUserPort } from '../ports/in/update-session-user.port';
import { SessionStorePort } from '../ports/out/session-store.port';

export class UpdateSessionUserUseCase implements UpdateSessionUserPort {
  constructor(private readonly store: SessionStorePort) {}

  execute(
    current: AuthenticatedUser | null,
    changes: SessionUserChanges,
  ): AuthenticatedUser | null {
    if (!current) return null;
    const updated = { ...current, ...changes };
    this.store.saveUser(updated);
    return updated;
  }
}

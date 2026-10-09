import { AuthenticatedUser } from '../../../domain/models/authenticated-user';
import { SessionUserChanges } from '../../models/session-user-changes';

/** Aplica cambios a la persona de la sesión; devuelve null si no hay sesión. */
export interface UpdateSessionUserPort {
  execute(current: AuthenticatedUser | null, changes: SessionUserChanges): AuthenticatedUser | null;
}

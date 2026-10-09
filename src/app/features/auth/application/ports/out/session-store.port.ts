import { AuthenticatedUser } from '../../../domain/models/authenticated-user';
import { AuthSession } from '../../models/auth-session';

/** Dónde se guarda la sesión entre recargas (hoy, `localStorage`). */
export interface SessionStorePort {
  /** La sesión guardada, si hay token y usuario. */
  load(): AuthSession | null;
  save(session: AuthSession): void;
  saveUser(user: AuthenticatedUser): void;
  accessToken(): string | null;
  clear(): void;
}

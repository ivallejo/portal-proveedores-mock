import { AuthenticatedUser } from '../../../domain/models/authenticated-user';

/** La sesión guardada de una visita anterior, si sigue siendo válida. */
export interface RestoreSessionPort {
  execute(): AuthenticatedUser | null;
}

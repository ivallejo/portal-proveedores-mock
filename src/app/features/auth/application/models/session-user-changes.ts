import { AuthenticatedUser } from '../../domain/models/authenticated-user';

/** Datos de la sesión que cambian sin volver a ingresar (Mi perfil o un 403 del backend). */
export type SessionUserChanges = Partial<
  Pick<AuthenticatedUser, 'name' | 'email' | 'mustChangePassword'>
>;

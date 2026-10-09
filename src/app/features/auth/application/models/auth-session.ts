import { AuthenticatedUser } from '../../domain/models/authenticated-user';

/** Sesión abierta: el token de acceso y la persona. */
export interface AuthSession {
  accessToken: string;
  user: AuthenticatedUser;
}

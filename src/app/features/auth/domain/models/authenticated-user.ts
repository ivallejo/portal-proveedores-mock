import { Role } from './role';

/** Persona con sesión abierta en el portal. */
export interface AuthenticatedUser {
  username: string;
  name: string;
  email?: string;
  emails?: string[];
  /** Rol principal (el primero de la lista). */
  role: Role;
  roles: Role[];
  providerId?: string;
  area?: string;
  /** La contraseña actual es temporal: debe cambiarla antes de usar el portal. */
  mustChangePassword?: boolean;
}

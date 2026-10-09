import { UserFacingError } from './user-facing-error';

/** Mensaje para el usuario: el del error si ya viene preparado; si no, el texto genérico de la pantalla. */
export function userFacingMessage(error: unknown, fallback: string): string {
  return error instanceof UserFacingError ? error.message : fallback;
}

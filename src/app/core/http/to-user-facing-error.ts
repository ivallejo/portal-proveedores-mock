import { UserFacingError } from '../../shared/errors/user-facing-error';
import { apiErrorMessage } from './api-error-message';

const NO_MESSAGE = '';

/**
 * Traduce un error HTTP a `UserFacingError` cuando el backend explica qué pasó (o no hubo conexión). Cualquier otro
 * error sigue igual, y la pantalla muestra su texto genérico (`userFacingMessage`).
 */
export function toUserFacingError(error: unknown): unknown {
  const message = apiErrorMessage(error, NO_MESSAGE);
  return message ? new UserFacingError(message) : error;
}

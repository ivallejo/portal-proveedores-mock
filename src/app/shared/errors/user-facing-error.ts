/**
 * Error con un mensaje listo para mostrar (por ejemplo, el `message` que devuelve el backend). Los adaptadores lo
 * crean a partir de la respuesta del servidor; las pantallas solo leen el mensaje, sin conocer HTTP.
 */
export class UserFacingError extends Error {
  override readonly name = 'UserFacingError';
}

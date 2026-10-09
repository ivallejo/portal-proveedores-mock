/**
 * Se entera de que la sesión empezó o terminó (por ejemplo, el menú, que debe volver a cargarse).
 * Auth no conoce a quienes escuchan: se registran como `SESSION_LISTENERS` en la composición de la app.
 */
export interface SessionListenerPort {
  sessionChanged(): void;
}

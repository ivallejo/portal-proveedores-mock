/** Vencimiento del token de sesión (JWT) en milisegundos; vacío si no se puede leer. */
export function tokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split('.')[1] ?? '';
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

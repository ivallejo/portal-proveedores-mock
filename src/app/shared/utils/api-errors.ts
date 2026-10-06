import { HttpErrorResponse } from '@angular/common/http';

/** Mensaje legible de un error HTTP del backend (campo `message`). */
export function apiErrorMessage(
  error: unknown,
  fallback = 'Inténtalo nuevamente en unos minutos.',
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'No fue posible conectar con el servidor. Inténtalo en unos minutos.';
    const message = error.error?.message ?? error.error?.detail;
    if (typeof message === 'string' && message) return message;
    const first = error.error?.errors && Object.values<string[]>(error.error.errors)[0]?.[0];
    if (first) return first;
  }
  return fallback;
}

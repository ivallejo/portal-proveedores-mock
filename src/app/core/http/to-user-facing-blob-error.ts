import { HttpErrorResponse } from '@angular/common/http';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { toUserFacingError } from './to-user-facing-error';

/**
 * Como `toUserFacingError`, para descargas (`responseType: 'blob'`): el cuerpo del error llega como Blob, así que
 * primero se lee el JSON del backend para mostrar su mensaje.
 */
export function toUserFacingBlobError(error: unknown): Observable<never> {
  if (!(error instanceof HttpErrorResponse) || !(error.error instanceof Blob))
    return throwError(() => toUserFacingError(error));
  return from(error.error.text()).pipe(
    switchMap((text) => {
      let body: unknown = null;
      try {
        body = JSON.parse(text);
      } catch {
        // Sin JSON: queda el mensaje genérico de la pantalla.
      }
      const parsed = new HttpErrorResponse({
        error: body,
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? undefined,
      });
      return throwError(() => toUserFacingError(parsed));
    }),
  );
}

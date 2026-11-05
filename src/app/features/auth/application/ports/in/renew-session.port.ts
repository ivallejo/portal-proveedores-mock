import { Observable } from 'rxjs';

/** Pide un token nuevo para la misma sesión y lo guarda. */
export interface RenewSessionPort {
  execute(): Observable<void>;
}

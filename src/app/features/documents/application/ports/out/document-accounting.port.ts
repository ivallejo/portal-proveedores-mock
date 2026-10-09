import { Observable } from 'rxjs';
import { PortalDocument } from '../../../domain/models/portal-document';

/** Acciones de Cuentas por pagar. Cada una devuelve el documento actualizado. */
export interface DocumentAccountingPort {
  reject(id: string, reason: string): Observable<PortalDocument>;
  observe(id: string, reason: string, email: string): Observable<PortalDocument>;
}

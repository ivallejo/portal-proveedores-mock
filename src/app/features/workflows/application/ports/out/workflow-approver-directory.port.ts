import { Observable } from 'rxjs';

/** Personas que se pueden asignar como aprobadores de un nivel. */
export interface WorkflowApproverDirectoryPort {
  list(): Observable<string[]>;
}

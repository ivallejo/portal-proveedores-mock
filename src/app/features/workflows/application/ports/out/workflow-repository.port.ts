import { Observable } from 'rxjs';
import { ApprovalWorkflow } from '../../../domain/models/approval-workflow';
import { WorkflowDraft } from '../../../domain/models/workflow-draft';

/** Workflows de aprobación (hoy en memoria; mañana, un adaptador HTTP con la misma interfaz). */
export interface WorkflowRepositoryPort {
  list(): Observable<ApprovalWorkflow[]>;
  save(draft: WorkflowDraft, id?: number): Observable<ApprovalWorkflow>;
  setActive(id: number, isActive: boolean): Observable<ApprovalWorkflow>;
  get(id: number): Observable<ApprovalWorkflow | undefined>;
}

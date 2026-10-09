import { Observable } from 'rxjs';
import { ApprovalWorkflow } from '../../../domain/models/approval-workflow';
import { WorkflowDraft } from '../../../domain/models/workflow-draft';

export interface SaveWorkflowPort {
  /** Sin `id` crea el workflow; con `id` lo reemplaza. */
  execute(draft: WorkflowDraft, id?: number): Observable<ApprovalWorkflow>;
}

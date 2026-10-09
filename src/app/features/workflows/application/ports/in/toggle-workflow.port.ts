import { Observable } from 'rxjs';
import { ApprovalWorkflow } from '../../../domain/models/approval-workflow';

export interface ToggleWorkflowPort {
  execute(id: number): Observable<ApprovalWorkflow>;
}

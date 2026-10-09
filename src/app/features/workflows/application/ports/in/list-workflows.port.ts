import { Observable } from 'rxjs';
import { ApprovalWorkflow } from '../../../domain/models/approval-workflow';

export interface ListWorkflowsPort {
  execute(): Observable<ApprovalWorkflow[]>;
}

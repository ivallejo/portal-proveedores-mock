import { Observable } from 'rxjs';
import { ApprovalWorkflow } from '../../domain/models/approval-workflow';
import { WorkflowDraft } from '../../domain/models/workflow-draft';
import { SaveWorkflowPort } from '../ports/in/save-workflow.port';
import { WorkflowRepositoryPort } from '../ports/out/workflow-repository.port';

export class SaveWorkflowUseCase implements SaveWorkflowPort {
  constructor(private readonly repository: WorkflowRepositoryPort) {}

  execute(draft: WorkflowDraft, id?: number): Observable<ApprovalWorkflow> {
    return this.repository.save(draft, id);
  }
}

import { Observable } from 'rxjs';
import { ApprovalWorkflow } from '../../domain/models/approval-workflow';
import { ListWorkflowsPort } from '../ports/in/list-workflows.port';
import { WorkflowRepositoryPort } from '../ports/out/workflow-repository.port';

export class ListWorkflowsUseCase implements ListWorkflowsPort {
  constructor(private readonly repository: WorkflowRepositoryPort) {}

  execute(): Observable<ApprovalWorkflow[]> {
    return this.repository.list();
  }
}

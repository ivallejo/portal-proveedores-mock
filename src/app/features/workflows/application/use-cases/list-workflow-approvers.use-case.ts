import { Observable, map } from 'rxjs';
import { GENERIC_APPROVERS } from '../../domain/rules/workflow-rules';
import { ListWorkflowApproversPort } from '../ports/in/list-workflow-approvers.port';
import { WorkflowApproverDirectoryPort } from '../ports/out/workflow-approver-directory.port';

/** Aprobadores genéricos (Área Usuaria, Jefatura de Área) seguidos de las personas del directorio. */
export class ListWorkflowApproversUseCase implements ListWorkflowApproversPort {
  constructor(private readonly directory: WorkflowApproverDirectoryPort) {}

  execute(): Observable<string[]> {
    return this.directory.list().pipe(map((people) => [...GENERIC_APPROVERS, ...people]));
  }
}

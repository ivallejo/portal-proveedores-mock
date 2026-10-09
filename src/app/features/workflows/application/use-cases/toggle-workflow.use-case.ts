import { Observable, switchMap, throwError } from 'rxjs';
import { ApprovalWorkflow } from '../../domain/models/approval-workflow';
import { ToggleWorkflowPort } from '../ports/in/toggle-workflow.port';
import { WorkflowRepositoryPort } from '../ports/out/workflow-repository.port';

/** Activa un workflow inactivo o desactiva uno activo. */
export class ToggleWorkflowUseCase implements ToggleWorkflowPort {
  constructor(private readonly repository: WorkflowRepositoryPort) {}

  execute(id: number): Observable<ApprovalWorkflow> {
    return this.repository
      .get(id)
      .pipe(
        switchMap((workflow) =>
          workflow
            ? this.repository.setActive(id, !workflow.isActive)
            : throwError(() => new Error(`No existe el workflow ${id}.`)),
        ),
      );
  }
}

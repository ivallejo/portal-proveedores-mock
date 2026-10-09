import { Provider, inject } from '@angular/core';
import { ListWorkflowApproversUseCase } from '../application/use-cases/list-workflow-approvers.use-case';
import { ListWorkflowsUseCase } from '../application/use-cases/list-workflows.use-case';
import { SaveWorkflowUseCase } from '../application/use-cases/save-workflow.use-case';
import { ToggleWorkflowUseCase } from '../application/use-cases/toggle-workflow.use-case';
import { InMemoryWorkflowApproverAdapter } from '../infrastructure/memory/in-memory-workflow-approver.adapter';
import { InMemoryWorkflowAdapter } from '../infrastructure/memory/in-memory-workflow.adapter';
import {
  LIST_WORKFLOWS,
  LIST_WORKFLOW_APPROVERS,
  SAVE_WORKFLOW,
  TOGGLE_WORKFLOW,
  WORKFLOW_APPROVER_DIRECTORY,
  WORKFLOW_REPOSITORY,
} from './workflows.tokens';

/**
 * Configuración › Workflows. Los adaptadores son en memoria; para usar la API basta con cambiar aquí
 * `InMemoryWorkflowAdapter` por un adaptador HTTP que implemente `WorkflowRepositoryPort`.
 */
export const WORKFLOWS_PROVIDERS: Provider[] = [
  { provide: WORKFLOW_REPOSITORY, useExisting: InMemoryWorkflowAdapter },
  { provide: WORKFLOW_APPROVER_DIRECTORY, useClass: InMemoryWorkflowApproverAdapter },
  {
    provide: LIST_WORKFLOWS,
    useFactory: () => new ListWorkflowsUseCase(inject(WORKFLOW_REPOSITORY)),
  },
  {
    provide: SAVE_WORKFLOW,
    useFactory: () => new SaveWorkflowUseCase(inject(WORKFLOW_REPOSITORY)),
  },
  {
    provide: TOGGLE_WORKFLOW,
    useFactory: () => new ToggleWorkflowUseCase(inject(WORKFLOW_REPOSITORY)),
  },
  {
    provide: LIST_WORKFLOW_APPROVERS,
    useFactory: () => new ListWorkflowApproversUseCase(inject(WORKFLOW_APPROVER_DIRECTORY)),
  },
];

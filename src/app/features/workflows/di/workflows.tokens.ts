import { InjectionToken } from '@angular/core';
import { ListWorkflowApproversPort } from '../application/ports/in/list-workflow-approvers.port';
import { ListWorkflowsPort } from '../application/ports/in/list-workflows.port';
import { SaveWorkflowPort } from '../application/ports/in/save-workflow.port';
import { ToggleWorkflowPort } from '../application/ports/in/toggle-workflow.port';
import { WorkflowApproverDirectoryPort } from '../application/ports/out/workflow-approver-directory.port';
import { WorkflowRepositoryPort } from '../application/ports/out/workflow-repository.port';

export const LIST_WORKFLOWS = new InjectionToken<ListWorkflowsPort>('LIST_WORKFLOWS');
export const SAVE_WORKFLOW = new InjectionToken<SaveWorkflowPort>('SAVE_WORKFLOW');
export const TOGGLE_WORKFLOW = new InjectionToken<ToggleWorkflowPort>('TOGGLE_WORKFLOW');
export const LIST_WORKFLOW_APPROVERS = new InjectionToken<ListWorkflowApproversPort>(
  'LIST_WORKFLOW_APPROVERS',
);
export const WORKFLOW_REPOSITORY = new InjectionToken<WorkflowRepositoryPort>(
  'WORKFLOW_REPOSITORY',
);
export const WORKFLOW_APPROVER_DIRECTORY = new InjectionToken<WorkflowApproverDirectoryPort>(
  'WORKFLOW_APPROVER_DIRECTORY',
);

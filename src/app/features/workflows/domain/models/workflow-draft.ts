import { ApprovalWorkflow } from './approval-workflow';

/** Workflow por guardar (sin id si es nuevo). */
export type WorkflowDraft = Omit<ApprovalWorkflow, 'id'>;

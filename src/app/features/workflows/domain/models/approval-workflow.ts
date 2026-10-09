import { ApprovalLevel } from './approval-level';

/** Workflow de aprobación de un tipo de documento en una sociedad. */
export interface ApprovalWorkflow {
  id: number;
  name: string;
  description: string;
  society: string;
  documentType: string;
  approvalLevels: ApprovalLevel[];
  isActive: boolean;
}

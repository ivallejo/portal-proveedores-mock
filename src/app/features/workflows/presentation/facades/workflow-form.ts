import { ApprovalLevel } from '../../domain/models/approval-level';

/** Formulario del workflow (se edita con ngModel). */
export interface WorkflowForm {
  name: string;
  description: string;
  society: string;
  documentType: string;
  approvalLevels: ApprovalLevel[];
}

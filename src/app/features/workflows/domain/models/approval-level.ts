import { ApprovalRule } from './approval-rule';

/** Nivel de aprobación: sus aprobadores y la regla para darlo por aprobado. */
export interface ApprovalLevel {
  approvers: string[];
  rule: ApprovalRule;
}

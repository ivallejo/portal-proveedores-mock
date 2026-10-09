import { ApprovalLevel } from '../models/approval-level';
import { ApprovalWorkflow } from '../models/approval-workflow';
import { WorkflowDraft } from '../models/workflow-draft';

/** Aprobadores genéricos que siempre se pueden asignar a un nivel. */
export const GENERIC_APPROVERS = ['Área Usuaria', 'Jefatura de Área'];

/** Busca por nombre, descripción o tipo de documento. */
export function filterWorkflows(
  workflows: readonly ApprovalWorkflow[],
  search: string,
): ApprovalWorkflow[] {
  const term = search.trim().toLowerCase();
  return workflows.filter(
    (item) =>
      !term || `${item.name} ${item.description} ${item.documentType}`.toLowerCase().includes(term),
  );
}

/** Nombre obligatorio y al menos un nivel, cada uno con al menos un aprobador. */
export function workflowDraftError(draft: WorkflowDraft): string {
  if (!draft.name.trim() || !draft.approvalLevels.length)
    return 'Completa el nombre y agrega al menos un nivel de aprobación.';
  if (draft.approvalLevels.some((level) => !level.approvers.length))
    return 'Cada nivel debe tener al menos un aprobador.';
  return '';
}

/** Aprobadores que coinciden con la búsqueda y que todavía no están en el nivel. */
export function approverCandidates(
  approvers: readonly string[],
  level: ApprovalLevel,
  search: string,
): string[] {
  const term = search.trim().toLowerCase();
  if (!term) return [];
  return approvers.filter(
    (approver) => !level.approvers.includes(approver) && approver.toLowerCase().includes(term),
  );
}

/** Intercambia un elemento con el anterior (-1) o el siguiente (1); igual si se sale de la lista. */
export function moveItem<T>(items: readonly T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  const result = [...items];
  if (target < 0 || target >= items.length) return result;
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}

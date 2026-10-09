import { ApprovalWorkflow } from '../models/approval-workflow';
import {
  approverCandidates,
  filterWorkflows,
  moveItem,
  workflowDraftError,
} from './workflow-rules';

const workflow = (name: string, documentType: string): ApprovalWorkflow => ({
  id: 1,
  name,
  description: '',
  society: 'Todas las sociedades',
  documentType,
  approvalLevels: [],
  isActive: true,
});

describe('workflow-rules', () => {
  it('busca por nombre, descripción o tipo de documento', () => {
    const list = [
      workflow('Sin OC', 'Sin Orden de Compra'),
      workflow('Especiales', 'Documento especial'),
    ];
    expect(filterWorkflows(list, ' especial ').map((item) => item.name)).toEqual(['Especiales']);
    expect(filterWorkflows(list, '').length).toBe(2);
  });

  it('exige nombre y aprobadores en cada nivel', () => {
    const draft = {
      ...workflow('', 'x'),
      approvalLevels: [{ approvers: ['A'], rule: 'any' as const }],
    };
    expect(workflowDraftError(draft)).toContain('Completa el nombre');
    expect(workflowDraftError({ ...draft, name: 'X', approvalLevels: [] })).toContain('Completa');
    expect(
      workflowDraftError({ ...draft, name: 'X', approvalLevels: [{ approvers: [], rule: 'all' }] }),
    ).toBe('Cada nivel debe tener al menos un aprobador.');
    expect(workflowDraftError({ ...draft, name: 'X' })).toBe('');
  });

  it('sugiere aprobadores que no están en el nivel', () => {
    const level = { approvers: ['Ana López'], rule: 'any' as const };
    expect(approverCandidates(['Ana López', 'Ana Ruiz', 'Bruno'], level, 'ana')).toEqual([
      'Ana Ruiz',
    ]);
    expect(approverCandidates(['Ana Ruiz'], level, ' ')).toEqual([]);
  });

  it('mueve un nivel sin salirse de la lista', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
  });
});

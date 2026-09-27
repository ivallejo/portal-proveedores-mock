import { Injectable, signal } from '@angular/core';

export type ApprovalRule = 'any' | 'all';

export interface ApprovalLevel {
  approvers: string[];
  rule: ApprovalRule;
}

export interface ApprovalWorkflow {
  id: number;
  name: string;
  description: string;
  society: string;
  documentType: string;
  approvalLevels: ApprovalLevel[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  readonly workflows = signal<ApprovalWorkflow[]>([
    {
      id: 1,
      name: 'Aprobación documentos sin OC',
      description: 'Revisión por el área solicitante antes de contabilización.',
      society: 'Todas las sociedades',
      documentType: 'Sin Orden de Compra',
      approvalLevels: [{ approvers: ['Área Usuaria'], rule: 'any' }],
      isActive: true,
    },
    {
      id: 2,
      name: 'Documentos especiales',
      description: 'Flujo interno para documentos registrados por colaboradores.',
      society: 'Todas las sociedades',
      documentType: 'Documento especial',
      approvalLevels: [
        { approvers: ['Área Usuaria'], rule: 'any' },
        { approvers: ['Jefatura de Área'], rule: 'any' },
      ],
      isActive: true,
    },
  ]);
  private nextId = 3;

  save(workflow: Omit<ApprovalWorkflow, 'id'>, id?: number): ApprovalWorkflow {
    const saved = { ...workflow, id: id ?? this.nextId++ };
    this.workflows.update((items) =>
      id ? items.map((item) => (item.id === id ? saved : item)) : [...items, saved],
    );
    return saved;
  }

  toggle(id: number): void {
    this.workflows.update((items) =>
      items.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item)),
    );
  }
}

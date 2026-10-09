import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkflowRepositoryPort } from '../../application/ports/out/workflow-repository.port';
import { ApprovalWorkflow } from '../../domain/models/approval-workflow';
import { WorkflowDraft } from '../../domain/models/workflow-draft';

/**
 * Workflows en memoria mientras no exista la API: los cambios duran lo que dura la sesión del navegador. Es único en
 * la aplicación (`providedIn: 'root'`) para que no se pierdan al salir y volver a la pantalla.
 */
@Injectable({ providedIn: 'root' })
export class InMemoryWorkflowAdapter implements WorkflowRepositoryPort {
  private workflows: ApprovalWorkflow[] = [
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
  ];
  private nextId = 3;

  list(): Observable<ApprovalWorkflow[]> {
    return of(this.workflows.map(copy));
  }

  get(id: number): Observable<ApprovalWorkflow | undefined> {
    const found = this.workflows.find((item) => item.id === id);
    return of(found && copy(found));
  }

  save(draft: WorkflowDraft, id?: number): Observable<ApprovalWorkflow> {
    const saved = copy({ ...draft, id: id ?? this.nextId++ });
    this.workflows = id
      ? this.workflows.map((item) => (item.id === id ? saved : item))
      : [...this.workflows, saved];
    return of(copy(saved));
  }

  setActive(id: number, isActive: boolean): Observable<ApprovalWorkflow> {
    this.workflows = this.workflows.map((item) => (item.id === id ? { ...item, isActive } : item));
    return of(copy(this.workflows.find((item) => item.id === id)!));
  }
}

/** Copia profunda: quien lee no puede modificar lo guardado. */
function copy(workflow: ApprovalWorkflow): ApprovalWorkflow {
  return {
    ...workflow,
    approvalLevels: workflow.approvalLevels.map((level) => ({
      ...level,
      approvers: [...level.approvers],
    })),
  };
}

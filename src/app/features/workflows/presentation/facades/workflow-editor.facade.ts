import { Injectable, inject, signal } from '@angular/core';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { LIST_WORKFLOW_APPROVERS, SAVE_WORKFLOW } from '../../di/workflows.tokens';
import { ApprovalRule } from '../../domain/models/approval-rule';
import { ApprovalWorkflow } from '../../domain/models/approval-workflow';
import { WorkflowDraft } from '../../domain/models/workflow-draft';
import {
  approverCandidates,
  moveItem,
  workflowDraftError,
} from '../../domain/rules/workflow-rules';
import { WORKFLOW_DOCUMENT_TYPES, WORKFLOW_SOCIETIES } from '../catalog/workflow-options';
import { WorkflowForm } from './workflow-form';
import { WorkflowListFacade } from './workflow-list.facade';

/** Alta y edición de un workflow: datos, niveles de aprobación y sus aprobadores. */
@Injectable()
export class WorkflowEditorFacade {
  private readonly saveWorkflowUseCase = inject(SAVE_WORKFLOW);
  private readonly listApprovers = inject(LIST_WORKFLOW_APPROVERS);
  private readonly list = inject(WorkflowListFacade);
  private readonly toast = inject(ToastService);

  readonly showWorkflowForm = signal(false);
  readonly editingWorkflow = signal<ApprovalWorkflow | null>(null);
  readonly workflowError = signal('');
  readonly workflowForm: WorkflowForm = {
    name: '',
    description: '',
    society: 'Todas las sociedades',
    documentType: 'Sin Orden de Compra',
    approvalLevels: [{ approvers: ['Área Usuaria'], rule: 'any' }],
  };
  readonly workflowSocieties = WORKFLOW_SOCIETIES;
  readonly workflowDocumentTypes = WORKFLOW_DOCUMENT_TYPES;
  readonly workflowApprovers = signal<string[]>([]);
  /** Texto buscado en cada nivel para agregar aprobadores. */
  readonly workflowApproverSearches: string[] = [];

  loadApprovers(): void {
    this.listApprovers.execute().subscribe((approvers) => this.workflowApprovers.set(approvers));
  }

  openWorkflowForm(workflow?: ApprovalWorkflow): void {
    this.workflowError.set('');
    this.editingWorkflow.set(workflow || null);
    this.workflowForm.name = workflow?.name || '';
    this.workflowForm.description = workflow?.description || '';
    this.workflowForm.society = workflow?.society || 'Todas las sociedades';
    this.workflowForm.documentType = workflow?.documentType || 'Sin Orden de Compra';
    this.workflowForm.approvalLevels = workflow?.approvalLevels.length
      ? workflow.approvalLevels.map((level) => ({ ...level, approvers: [...level.approvers] }))
      : [{ approvers: ['Área Usuaria'], rule: 'any' }];
    this.workflowApproverSearches.length = this.workflowForm.approvalLevels.length;
    this.workflowApproverSearches.fill('');
    this.showWorkflowForm.set(true);
  }

  closeWorkflowForm(): void {
    this.showWorkflowForm.set(false);
    this.editingWorkflow.set(null);
    this.workflowError.set('');
  }

  toggleWorkflowApprover(levelIndex: number, approver: string): void {
    const level = this.workflowForm.approvalLevels[levelIndex];
    level.approvers = level.approvers.includes(approver)
      ? level.approvers.filter((item) => item !== approver)
      : [...level.approvers, approver];
  }

  removeWorkflowApprover(levelIndex: number, approver: string): void {
    const level = this.workflowForm.approvalLevels[levelIndex];
    level.approvers = level.approvers.filter((item) => item !== approver);
  }

  setWorkflowApproverSearch(levelIndex: number, value: string): void {
    this.workflowApproverSearches[levelIndex] = value;
  }

  filteredWorkflowApprovers(levelIndex: number): string[] {
    return approverCandidates(
      this.workflowApprovers(),
      this.workflowForm.approvalLevels[levelIndex],
      this.workflowApproverSearches[levelIndex] || '',
    );
  }

  addWorkflowLevel(): void {
    this.workflowForm.approvalLevels = [
      ...this.workflowForm.approvalLevels,
      { approvers: [], rule: 'any' },
    ];
    this.workflowApproverSearches.push('');
  }

  removeWorkflowLevel(levelIndex: number): void {
    this.workflowForm.approvalLevels = this.workflowForm.approvalLevels.filter(
      (_, index) => index !== levelIndex,
    );
    this.workflowApproverSearches.splice(levelIndex, 1);
  }

  moveWorkflowLevel(levelIndex: number, direction: -1 | 1): void {
    this.workflowForm.approvalLevels = moveItem(
      this.workflowForm.approvalLevels,
      levelIndex,
      direction,
    );
    const searches = moveItem(this.workflowApproverSearches, levelIndex, direction);
    this.workflowApproverSearches.splice(0, searches.length, ...searches);
  }

  setWorkflowRule(levelIndex: number, rule: ApprovalRule): void {
    this.workflowForm.approvalLevels[levelIndex].rule = rule;
  }

  saveWorkflow(): void {
    const draft: WorkflowDraft = {
      name: this.workflowForm.name.trim(),
      description: this.workflowForm.description.trim(),
      society: this.workflowForm.society,
      documentType: this.workflowForm.documentType,
      approvalLevels: this.workflowForm.approvalLevels.map((level) => ({
        ...level,
        approvers: [...level.approvers],
      })),
      isActive: this.editingWorkflow()?.isActive ?? true,
    };
    const error = workflowDraftError(draft);
    if (error) {
      this.workflowError.set(error);
      return;
    }
    this.saveWorkflowUseCase.execute(draft, this.editingWorkflow()?.id).subscribe((saved) => {
      this.list.upsert(saved);
      this.closeWorkflowForm();
      this.toast.show('El workflow de aprobación se guardó correctamente');
    });
  }
}

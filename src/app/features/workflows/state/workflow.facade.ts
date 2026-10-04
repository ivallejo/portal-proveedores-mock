import { Injectable, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ApprovalLevel, ApprovalWorkflow, WorkflowService } from '../services/workflow.service';
import { MockUsersStore } from '../../../shared/state/mock-users.store';
import { roleLabel } from '../../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class WorkflowFacade {
  readonly roleLabel = roleLabel;
  readonly workflowService = inject(WorkflowService);
  readonly mockUsersStore = inject(MockUsersStore);
  private readonly toast = inject(ToastService);
  readonly workflowSearch = signal('');
  readonly workflowPage = signal(1);
  readonly workflowPageSize = signal(5);
  readonly showWorkflowForm = signal(false);
  readonly editingWorkflow = signal<ApprovalWorkflow | null>(null);
  readonly workflowError = signal('');
  readonly workflowForm = {
    name: '',
    description: '',
    society: 'Todas las sociedades',
    documentType: 'Sin Orden de Compra',
    approvalLevels: [{ approvers: ['Área Usuaria'], rule: 'any' }] as ApprovalLevel[],
  };
  readonly workflowSocieties = [
    'Todas las sociedades',
    'Naviera Transoceánica S.A.',
    'Naviera Transoceánica Perú S.A.',
    'Ultratag S.A.',
    'Petral S.A.',
    'RENADSA S.A.',
  ];
  readonly workflowDocumentTypes = [
    'Con Orden de Compra',
    'Sin Orden de Compra',
    'Documento especial',
  ];
  readonly workflowApprovers = computed(() => [
    'Área Usuaria',
    'Jefatura de Área',
    ...this.mockUsersStore
      .users()
      .filter((user) => user.roles.some((role) => role !== 'Proveedor'))
      .map((user) => user.companyName),
  ]);
  readonly workflowApproverSearches: string[] = [];
  readonly filteredWorkflows = computed(() => {
    const term = this.workflowSearch().trim().toLowerCase();
    return this.workflowService
      .workflows()
      .filter(
        (item) =>
          !term ||
          `${item.name} ${item.description} ${item.documentType}`.toLowerCase().includes(term),
      );
  });
  readonly workflowPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredWorkflows().length / this.workflowPageSize())),
  );
  readonly workflowsPage = computed(() => {
    const start = (this.workflowPage() - 1) * this.workflowPageSize();
    return this.filteredWorkflows().slice(start, start + this.workflowPageSize());
  });
  readonly workflowPaginationPages = computed(() =>
    Array.from({ length: this.workflowPageCount() }, (_, index) => index + 1),
  );

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
  setWorkflowSearch(value: string): void {
    this.workflowSearch.set(value);
    this.workflowPage.set(1);
  }
  setWorkflowPageSize(value: string): void {
    this.workflowPageSize.set(Number(value));
    this.workflowPage.set(1);
  }
  setWorkflowPage(page: number): void {
    this.workflowPage.set(Math.min(Math.max(page, 1), this.workflowPageCount()));
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
    this.workflowForm.approvalLevels[levelIndex].approvers = this.workflowForm.approvalLevels[
      levelIndex
    ].approvers.filter((item) => item !== approver);
  }
  setWorkflowApproverSearch(levelIndex: number, value: string): void {
    this.workflowApproverSearches[levelIndex] = value;
  }
  filteredWorkflowApprovers(levelIndex: number): string[] {
    const level = this.workflowForm.approvalLevels[levelIndex];
    const term = (this.workflowApproverSearches[levelIndex] || '').trim().toLowerCase();
    if (!term) return [];
    return this.workflowApprovers().filter(
      (approver) => !level.approvers.includes(approver) && approver.toLowerCase().includes(term),
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
    const targetIndex = levelIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.workflowForm.approvalLevels.length) return;
    const levels = [...this.workflowForm.approvalLevels];
    [levels[levelIndex], levels[targetIndex]] = [levels[targetIndex], levels[levelIndex]];
    this.workflowForm.approvalLevels = levels;
    [this.workflowApproverSearches[levelIndex], this.workflowApproverSearches[targetIndex]] = [
      this.workflowApproverSearches[targetIndex],
      this.workflowApproverSearches[levelIndex],
    ];
  }
  setWorkflowRule(levelIndex: number, rule: 'any' | 'all'): void {
    this.workflowForm.approvalLevels[levelIndex].rule = rule;
  }
  saveWorkflow(): void {
    if (!this.workflowForm.name.trim() || !this.workflowForm.approvalLevels.length) {
      this.workflowError.set('Completa el nombre y agrega al menos un nivel de aprobación.');
      return;
    }
    if (this.workflowForm.approvalLevels.some((level) => !level.approvers.length)) {
      this.workflowError.set('Cada nivel debe tener al menos un aprobador.');
      return;
    }
    this.workflowService.save(
      {
        name: this.workflowForm.name.trim(),
        description: this.workflowForm.description.trim(),
        society: this.workflowForm.society,
        documentType: this.workflowForm.documentType,
        approvalLevels: this.workflowForm.approvalLevels.map((level) => ({
          ...level,
          approvers: [...level.approvers],
        })),
        isActive: this.editingWorkflow()?.isActive ?? true,
      },
      this.editingWorkflow()?.id,
    );
    this.closeWorkflowForm();
    this.toast.show('El workflow de aprobación se guardó correctamente');
  }
  toggleWorkflow(workflow: ApprovalWorkflow): void {
    this.workflowService.toggle(workflow.id);
  }
}

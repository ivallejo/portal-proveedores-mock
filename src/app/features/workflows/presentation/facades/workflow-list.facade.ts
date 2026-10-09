import { Injectable, computed, inject, signal } from '@angular/core';
import { LIST_WORKFLOWS, TOGGLE_WORKFLOW } from '../../di/workflows.tokens';
import { ApprovalWorkflow } from '../../domain/models/approval-workflow';
import { filterWorkflows } from '../../domain/rules/workflow-rules';

/** Workflows configurados: búsqueda, paginación y activación. */
@Injectable()
export class WorkflowListFacade {
  private readonly listWorkflows = inject(LIST_WORKFLOWS);
  private readonly toggleWorkflowUseCase = inject(TOGGLE_WORKFLOW);

  readonly workflows = signal<ApprovalWorkflow[]>([]);
  readonly workflowSearch = signal('');
  readonly workflowPage = signal(1);
  readonly workflowPageSize = signal(5);

  readonly filteredWorkflows = computed(() =>
    filterWorkflows(this.workflows(), this.workflowSearch()),
  );
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

  load(): void {
    this.listWorkflows.execute().subscribe((workflows) => this.workflows.set(workflows));
  }

  /** Reemplaza (o agrega) el workflow guardado. */
  upsert(saved: ApprovalWorkflow): void {
    this.workflows.update((items) =>
      items.some((item) => item.id === saved.id)
        ? items.map((item) => (item.id === saved.id ? saved : item))
        : [...items, saved],
    );
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

  toggleWorkflow(workflow: ApprovalWorkflow): void {
    this.toggleWorkflowUseCase.execute(workflow.id).subscribe((saved) => this.upsert(saved));
  }
}

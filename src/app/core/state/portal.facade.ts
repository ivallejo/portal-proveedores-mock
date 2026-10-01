import { Injectable, computed, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { AprobacionService } from '../../features/approvals/services/aprobacion.service';
import { AuthService } from '../auth/auth.service';
import { ContabilizacionService } from '../../features/accounting/services/contabilizacion.service';
import { DocumentoService } from '../../features/documents/services/documento.service';
import { NavigationService, Screen } from '../navigation/navigation.service';
import { MockUsersStore } from '../../shared/state/mock-users.store';
import {
  WorkflowService,
  ApprovalLevel,
  ApprovalWorkflow,
} from '../../features/workflows/services/workflow.service';
import { Documento, Role, roleLabel } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class PortalFacade {
  readonly roleLabel = roleLabel;
  readonly Math = Math;
  readonly auth = inject(AuthService);
  readonly documentoService = inject(DocumentoService);
  readonly aprobacionService = inject(AprobacionService);
  readonly contabilizacionService = inject(ContabilizacionService);
  readonly mockUsersStore = inject(MockUsersStore);
  readonly workflowService = inject(WorkflowService);
  readonly navigation = inject(NavigationService);
  readonly screen = this.navigation.screen;
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly expandedId = signal<number | null>(null);
  readonly documents = this.documentoService.documents;
  readonly approvalItems = signal(
    this.documents().filter((item) => item.status === 'Pendiente de aprobación'),
  );
  readonly accountingItems = signal(
    this.documents().filter((item) => item.status === 'Pendiente de contabilización'),
  );
  readonly accountingQuery = signal('');
  readonly accountingPage = signal(1);
  readonly accountingPageSize = signal(5);
  readonly filteredAccountingItems = computed(() => {
    const term = this.accountingQuery().trim().toLowerCase();
    return this.accountingItems().filter((item) =>
      `${item.numero} ${item.proveedor} ${item.sociedad} ${item.contabilizacion?.numero || ''}`
        .toLowerCase()
        .includes(term),
    );
  });
  readonly accountingPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredAccountingItems().length / this.accountingPageSize())),
  );
  readonly accountingItemsPage = computed(() => {
    const start = (this.accountingPage() - 1) * this.accountingPageSize();
    return this.filteredAccountingItems().slice(start, start + this.accountingPageSize());
  });
  readonly accountingPaginationPages = computed(() =>
    Array.from({ length: this.accountingPageCount() }, (_, index) => index + 1),
  );
  readonly filterStatus = signal('');
  readonly filterType = signal('');
  readonly documentQuery = signal('');
  readonly documentDateFrom = signal('');
  readonly documentDateTo = signal('');
  readonly documentFilters = { query: '', type: '', status: '', dateFrom: '', dateTo: '' };
  readonly documentPage = signal(1);
  readonly documentPageSize = signal(5);
  readonly approvalComment = signal<Record<number, string>>({});
  readonly approvalTarget = signal<Record<number, string>>({});
  readonly query = signal('');
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
  readonly accountingSociety = signal('');
  readonly accountingType = signal('');
  readonly providerDocuments = computed(() =>
    this.documents().filter(
      (item) =>
        this.auth.user()?.role !== 'Proveedor' || item.providerId === this.auth.user()?.providerId,
    ),
  );
  readonly filteredDocuments = computed(() =>
    this.providerDocuments().filter((item) => {
      const term = this.documentQuery().trim().toLowerCase();
      const content = `${item.numero} ${item.oc || ''} ${item.sociedad} ${item.tipo} ${item.status}`;
      return (
        (!term || content.toLowerCase().includes(term)) &&
        (!this.filterStatus() || item.status === this.filterStatus()) &&
        (!this.filterType() || item.tipo === this.filterType()) &&
        (!this.documentDateFrom() || item.fecha >= this.documentDateFrom()) &&
        (!this.documentDateTo() || item.fecha <= this.documentDateTo())
      );
    }),
  );
  readonly documentPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredDocuments().length / this.documentPageSize())),
  );
  readonly documentsPage = computed(() => {
    const start = (this.documentPage() - 1) * this.documentPageSize();
    return this.filteredDocuments().slice(start, start + this.documentPageSize());
  });
  readonly documentPaginationPages = computed(() =>
    Array.from({ length: this.documentPageCount() }, (_, index) => index + 1),
  );
  readonly pendingCount = computed(
    () =>
      this.providerDocuments().filter((item) =>
        ['Pendiente de aprobación', 'Pendiente de contabilización'].includes(item.status),
      ).length,
  );
  readonly approvedCount = computed(
    () =>
      this.providerDocuments().filter((item) =>
        ['Aprobado', 'Pendiente de contabilización', 'Contabilizado'].includes(item.status),
      ).length,
  );
  readonly rejectedCount = computed(
    () =>
      this.providerDocuments().filter((item) =>
        ['Rechazado', 'Devuelto al proveedor'].includes(item.status),
      ).length,
  );

  logout(): void {
    this.auth.logout();
    this.navigation.goTo('dashboard');
  }
  navigate(screen: Screen): void {
    this.error.set('');
    this.message.set('');
    this.navigation.goTo(screen);
    if (screen === 'documentos') this.documentPage.set(1);
    if (screen === 'aprobaciones') this.loadApprovals();
    if (screen === 'contabilizacion') this.loadAccounting();
  }
  isRole(role: Role): boolean {
    return this.auth.user()?.role === role;
  }
  loadApprovals(): void {
    this.loading.set(true);
    this.aprobacionService.pendientes().subscribe((items) => {
      this.approvalItems.set(items);
      this.loading.set(false);
    });
  }
  loadAccounting(): void {
    this.loading.set(true);
    this.contabilizacionService.ejecutarJobDiario().subscribe(() =>
      this.contabilizacionService
        .contabilizados(this.accountingSociety(), this.accountingType())
        .subscribe((items) => {
          this.accountingItems.set(items);
          this.accountingPage.set(1);
          this.loading.set(false);
        }),
    );
  }
  toggle(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
  setDocumentQuery(value: string): void {
    this.documentFilters.query = value;
  }
  setDocumentType(value: string): void {
    this.documentFilters.type = value;
  }
  setDocumentStatus(value: string): void {
    this.documentFilters.status = value;
  }
  setDocumentDateFrom(value: string): void {
    this.documentFilters.dateFrom = value;
  }
  setDocumentDateTo(value: string): void {
    this.documentFilters.dateTo = value;
  }
  applyDocumentFilters(): void {
    this.documentQuery.set(this.documentFilters.query);
    this.filterType.set(this.documentFilters.type);
    this.filterStatus.set(this.documentFilters.status);
    this.documentDateFrom.set(this.documentFilters.dateFrom);
    this.documentDateTo.set(this.documentFilters.dateTo);
    this.documentPage.set(1);
  }
  clearDocumentFilters(): void {
    this.documentFilters.query = '';
    this.documentFilters.type = '';
    this.documentFilters.status = '';
    this.documentFilters.dateFrom = '';
    this.documentFilters.dateTo = '';
    this.applyDocumentFilters();
  }
  setDocumentPageSize(value: string): void {
    this.documentPageSize.set(Number(value));
    this.documentPage.set(1);
  }
  setDocumentPage(page: number): void {
    this.documentPage.set(page);
  }
  approve(id: number): void {
    this.loading.set(true);
    this.aprobacionService.aprobar(id).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} aprobado y enviado a contabilización.`);
      this.loadApprovals();
    });
  }
  reject(id: number): void {
    const comment = this.approvalComment()[id]?.trim();
    if (!comment) {
      this.error.set('El comentario es obligatorio para rechazar.');
      return;
    }
    this.loading.set(true);
    this.aprobacionService.rechazar(id, comment).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} rechazado.`);
      this.loadApprovals();
    });
  }
  derive(id: number): void {
    const target = this.approvalTarget()[id]?.trim();
    if (!target) {
      this.error.set('Selecciona el aprobador al que se derivará el documento.');
      return;
    }
    this.loading.set(true);
    this.aprobacionService.derivar(id, target).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} derivado a ${target}.`);
      this.loadApprovals();
    });
  }
  resendAttachments(id: number): void {
    this.loading.set(true);
    this.contabilizacionService.reenviarAnexos(id).subscribe((item) => {
      this.loading.set(false);
      this.showToast(`Los anexos de ${item.numero} fueron reenviados a SAP.`);
    });
  }
  private showToast(text: string): void {
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Operación completada',
      text,
      showCloseButton: true,
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
    });
  }
  setAccountingQuery(value: string): void {
    this.accountingQuery.set(value);
    this.accountingPage.set(1);
  }
  setAccountingPageSize(value: string): void {
    this.accountingPageSize.set(Number(value));
    this.accountingPage.set(1);
  }
  setAccountingPage(page: number): void {
    this.accountingPage.set(page);
  }
  attachmentNames(item: Documento): string[] {
    return (item.details['archivos'] || '')
      .split(',')
      .map((file) => file.trim())
      .filter(Boolean);
  }
  downloadAttachment(item: Documento, fileName: string): void {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'xml' ? 'application/xml' : 'application/pdf';
    const content =
      extension === 'xml'
        ? `<?xml version="1.0" encoding="UTF-8"?>\n<documento numero="${item.numero}" />`
        : `Archivo mock del documento ${item.numero}\n\nNombre: ${fileName}`;
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
  setComment(id: number, value: string): void {
    this.approvalComment.update((values) => ({ ...values, [id]: value }));
  }
  setApprovalTarget(id: number, value: string): void {
    this.approvalTarget.update((values) => ({ ...values, [id]: value }));
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
    this.showToast('El workflow de aprobación se guardó correctamente.');
  }
  toggleWorkflow(workflow: ApprovalWorkflow): void {
    this.workflowService.toggle(workflow.id);
  }
  statusClass(status: string): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }
}

function isRoleInternal(role: Role | undefined): boolean {
  return role === 'Colaborador interno';
}

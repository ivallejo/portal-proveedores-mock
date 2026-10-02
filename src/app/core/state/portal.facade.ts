import { Injectable, computed, inject, signal } from '@angular/core';
import { AprobacionService } from '../../features/approvals/services/aprobacion.service';
import { AuthService } from '../auth/auth.service';
import { ContabilizacionService } from '../../features/accounting/services/contabilizacion.service';
import { DocumentoService } from '../../features/documents/services/documento.service';
import { NavigationService, Screen } from '../navigation/navigation.service';
import { Documento, Role } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class PortalFacade {
  readonly Math = Math;
  readonly auth = inject(AuthService);
  readonly documentoService = inject(DocumentoService);
  readonly aprobacionService = inject(AprobacionService);
  readonly contabilizacionService = inject(ContabilizacionService);
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
      this.message.set(`Los anexos de ${item.numero} fueron reenviados a SAP.`);
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
  statusClass(status: string): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }
}

function isRoleInternal(role: Role | undefined): boolean {
  return role === 'Colaborador interno';
}

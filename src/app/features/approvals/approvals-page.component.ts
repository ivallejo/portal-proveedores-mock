import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { CatalogFacade } from '../catalog';
import { DocumentHistoryComponent } from '../../shared/documents/document-history.component';
import {
  ENTRY_TONE,
  PortalDocument,
  STATUS_TONE,
  Attachment,
} from '../../shared/documents/document.model';
import {
  APPROVAL_STATUSES,
  DocumentFilters,
  DocumentsService,
} from '../../shared/documents/documents.service';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../shared/ui/dialog/dialog.component';
import { CalloutComponent } from '../../shared/ui/callout/callout.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';
import { ResultStateComponent } from '../../shared/ui/result-state/result-state.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination/pagination.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { SelectOption } from '../../shared/ui/select/select-option';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { currencyTone } from '../../shared/ui/tone/currency-tone';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { currencyName, money } from '../../shared/utils/money-format.util';
import { formatDate } from '../../shared/utils/date-format.util';
import { onlyDigits } from '../../shared/utils/text-format.util';
import { apiErrorMessage } from '../../core/http/api-error-message';

const DEFAULT_FILTERS: DocumentFilters = { ruc: '', status: '' };

const PAGE_SIZE = 10;

type Panel = 'approve' | 'reassign' | 'reject' | null;

type ReferenceType = 'pedido' | 'viaje';

interface ActionResult {
  kind: 'ok' | 'bad' | 'swap';
  title: string;
  text: string;
  mail: string;
}

@Component({
  selector: 'app-approvals-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    BadgeComponent,
    IconComponent,
    SpinnerComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ResultStateComponent,
    CalloutComponent,
    DialogComponent,
    DocumentHistoryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './approvals-page.component.html',
})
export class ApprovalsPageComponent {
  private readonly documents = inject(DocumentsService);
  private readonly catalog = inject(CatalogFacade);
  private readonly toast = inject(ToastService);

  readonly draft = signal<DocumentFilters>({ ...DEFAULT_FILTERS });
  readonly applied = signal<DocumentFilters>({ ...DEFAULT_FILTERS });
  readonly loading = signal(true);
  readonly rows = signal<PortalDocument[]>([]);
  readonly page = signal(1);

  readonly detail = signal<PortalDocument | null>(null);
  readonly detailLoading = signal(false);
  readonly panel = signal<Panel>(null);
  readonly busy = signal(false);
  readonly result = signal<ActionResult | null>(null);

  readonly referenceType = signal<ReferenceType>('pedido');
  readonly reference = signal('');
  readonly referenceError = signal(false);
  readonly reassignArea = signal('');
  readonly reassignApprover = signal('');
  readonly reassignError = signal(false);
  readonly reassignReason = signal('');
  readonly reason = signal('');
  readonly reasonError = signal(false);

  readonly statusTone = STATUS_TONE;
  readonly entryTone = ENTRY_TONE;
  readonly currencyTone = currencyTone;
  readonly money = money;
  readonly formatDate = formatDate;
  readonly currencyName = currencyName;
  readonly pageSize = PAGE_SIZE;

  readonly statusOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    ...APPROVAL_STATUSES.map((status) => ({
      value: status,
      label: status,
      tone: STATUS_TONE[status],
    })),
  ];
  /** Para reasignar: áreas de la sociedad del documento. */
  readonly areaOptions = computed(() =>
    this.catalog.areaOptionsFor(this.detail()?.companyCode ?? ''),
  );
  readonly approverOptions = computed(() =>
    this.catalog.approverOptions(
      this.reassignArea(),
      this.detail()?.companyCode ?? '',
      this.detail()?.approver ?? '',
    ),
  );

  readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const count = (status: string) =>
      String(this.rows().filter((doc) => doc.status === status).length);
    return {
      pending: count('Pendiente de aprobación'),
      approved: count('Aprobado'),
      accounting: count('Pendiente de contabilización'),
      rejected: count('Rechazado'),
    };
  });
  readonly isPending = computed(() => this.detail()?.status === 'Pendiente de aprobación');
  readonly isXml = computed(() => this.detail()?.entryType !== 'Documento especial');
  readonly referenceLabel = computed(() =>
    this.referenceType() === 'viaje' ? 'N° de viaje' : 'N° de pedido',
  );
  readonly footNote = computed(() => {
    if (this.result()) return 'El listado ya refleja el nuevo estado del documento.';
    if (!this.isPending()) return 'Documento sin acciones pendientes.';
    return this.panel()
      ? 'Completa la acción o cancélala para volver.'
      : 'Al aprobar, el documento pasa a Pendiente de contabilización.';
  });

  constructor() {
    this.catalog.load();
    inject(PageLoadingService).bind(this.loading, 'Cargando documentos');
    this.search();
  }

  setFilter<K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value);
    this.setFilter('ruc', input.value);
  }

  search(): void {
    this.applied.set({ ...this.draft() });
    this.reload();
  }

  clear(): void {
    this.draft.set({ ...DEFAULT_FILTERS });
    this.search();
  }

  open(doc: PortalDocument): void {
    this.resetPanels();
    this.result.set(null);
    this.detail.set(doc);
    this.detailLoading.set(true);
    this.documents.get(doc.id).subscribe({
      next: (fresh) => {
        if (this.detail()?.id !== doc.id) return;
        this.detail.set(fresh);
        this.detailLoading.set(false);
      },
      error: (error) => {
        this.detail.set(null);
        this.detailLoading.set(false);
        this.toast.show(apiErrorMessage(error, 'No fue posible cargar el documento.'));
      },
    });
  }

  close(): void {
    this.detail.set(null);
    this.result.set(null);
    this.resetPanels();
  }

  openPanel(panel: Panel): void {
    this.resetPanels();
    this.panel.set(panel);
  }

  closePanel(): void {
    this.resetPanels();
  }

  onReference(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 20);
    this.reference.set(input.value);
    this.referenceError.set(false);
  }

  setReassignArea(area: string): void {
    this.reassignArea.set(area);
    this.reassignApprover.set('');
    this.reassignError.set(false);
  }

  approve(): void {
    const doc = this.detail();
    const reference = this.reference().trim();
    if (!doc) return;
    if (!reference) {
      this.referenceError.set(true);
      return;
    }
    const label = this.referenceLabel();
    this.run(this.documents.approve(doc.id, this.referenceType(), reference), (updated) => ({
      kind: 'ok',
      title: 'Documento aprobado',
      text: `El documento ${updated.number} fue aprobado con ${label} ${reference} y se envió a contabilización. Su estado ahora es Pendiente de contabilización.`,
      mail: 'Se notificó al área de Contabilidad.',
    }));
  }

  reassign(): void {
    const doc = this.detail();
    if (!doc) return;
    if (!this.reassignArea() || !this.reassignApprover() || !this.reassignReason().trim()) {
      this.reassignError.set(true);
      return;
    }
    const area = this.reassignArea();
    const approverId = this.reassignApprover();
    const approver =
      this.catalog.approvers(area, doc.companyCode).find((item) => item.id === approverId)?.name ??
      '';
    const reason = this.reassignReason().trim();
    this.run(this.documents.reassign(doc.id, approverId, reason), (updated) => ({
      kind: 'swap',
      title: 'Documento reasignado',
      text: `El documento ${updated.number} fue reasignado a ${approver} (${area}).`,
      mail: `Enviamos un correo a ${approver} indicando que tiene un documento por aprobar.`,
    }));
  }

  reject(): void {
    const doc = this.detail();
    const reason = this.reason().trim();
    if (!doc) return;
    if (!reason) {
      this.reasonError.set(true);
      return;
    }
    this.run(this.documents.reject(doc.id, reason, 'aprobador'), (updated) => ({
      kind: 'bad',
      title: 'Documento rechazado',
      text: `El documento ${updated.number} de ${updated.providerName} fue rechazado.`,
      mail: 'Enviamos un correo al proveedor notificando el rechazo.',
    }));
  }

  download(doc: PortalDocument, file: Attachment): void {
    this.documents.download(doc, file).subscribe({
      error: (error) =>
        this.toast.show(apiErrorMessage(error, 'No fue posible descargar el archivo.')),
    });
  }

  private run(
    action: Observable<PortalDocument>,
    describe: (doc: PortalDocument) => ActionResult,
  ): void {
    if (this.busy()) return;
    this.busy.set(true);
    action.subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.detail.set(updated);
        this.result.set(describe(updated));
        this.resetPanels();
        this.reload(false);
      },
      error: (error) => {
        this.busy.set(false);
        this.toast.show(apiErrorMessage(error, 'No fue posible completar la acción.'));
      },
    });
  }

  private reload(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.documents.approvals(this.applied()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        if (showLoading) this.page.set(1);
        this.loading.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.loading.set(false);
        this.toast.show(apiErrorMessage(error, 'No fue posible cargar los documentos.'));
      },
    });
  }

  private resetPanels(): void {
    this.panel.set(null);
    this.referenceType.set('pedido');
    this.reference.set('');
    this.referenceError.set(false);
    this.reassignArea.set('');
    this.reassignApprover.set('');
    this.reassignError.set(false);
    this.reassignReason.set('');
    this.reason.set('');
    this.reasonError.set(false);
  }
}

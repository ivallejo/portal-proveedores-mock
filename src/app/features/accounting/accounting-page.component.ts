import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { DocumentHistoryComponent } from '../../shared/documents/document-history.component';
import {
  ATTACHMENT_TONE,
  ENTRY_LABEL,
  ENTRY_TONE,
  PortalDocument,
  STATUS_TONE,
  Attachment,
} from '../../shared/documents/document.model';
import {
  ACCOUNTING_STATUSES,
  DocumentFilters,
  DocumentsService,
} from '../../shared/documents/documents.service';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../shared/ui/dialog/dialog.component';
import {
  CalloutComponent,
  EmptyStateComponent,
  LoadingStateComponent,
  ResultStateComponent,
} from '../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import {
  KpiCardComponent,
  PageHeaderComponent,
  PaginationComponent,
} from '../../shared/ui/page/page.components';
import { SelectComponent, SelectOption } from '../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { currencyTone } from '../../shared/ui/tone';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { currencyName, formatDate, money, onlyDigits } from '../../shared/utils/format';
import { apiErrorMessage } from '../../core/http/api-error-message';

const DEFAULT_FILTERS: DocumentFilters = { ruc: '', status: '' };
const PAGE_SIZE = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Panel = 'reject' | 'observe' | null;

interface ActionResult {
  kind: 'bad' | 'warn';
  title: string;
  text: string;
  reason: string;
  mail: string;
}

@Component({
  selector: 'app-accounting-page',
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
  templateUrl: './accounting-page.component.html',
})
export class AccountingPageComponent {
  private readonly documents = inject(DocumentsService);
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
  readonly reason = signal('');
  readonly email = signal('');
  readonly panelError = signal('');
  readonly reasonInvalid = signal(false);
  readonly emailInvalid = signal(false);

  readonly statusTone = STATUS_TONE;
  readonly entryTone = ENTRY_TONE;
  readonly entryLabel = ENTRY_LABEL;
  readonly attachmentTone = ATTACHMENT_TONE;
  readonly currencyTone = currencyTone;
  readonly money = money;
  readonly formatDate = formatDate;
  readonly currencyName = currencyName;
  readonly pageSize = PAGE_SIZE;

  readonly statusOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    ...ACCOUNTING_STATUSES.map((status) => ({
      value: status,
      label: status,
      tone: STATUS_TONE[status],
    })),
  ];

  readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const count = (status: string) =>
      String(this.rows().filter((doc) => doc.status === status).length);
    return {
      pending: count('Pendiente de contabilización'),
      booked: count('Contabilizado'),
      observed: count('Observado'),
      rejected: count('Rechazado'),
    };
  });
  readonly isPending = computed(() => this.detail()?.status === 'Pendiente de contabilización');
  readonly footNote = computed(() => {
    if (this.result()) return 'El listado ya refleja el nuevo estado del documento.';
    if (!this.isPending()) return 'Documento sin acciones pendientes.';
    return this.panel()
      ? 'Completa la acción o cancélala para volver.'
      : 'Si el documento está conforme, SAP lo contabilizará en el proceso diario.';
  });

  constructor() {
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

  rowCaption(doc: PortalDocument): string {
    if (doc.entryType === 'Con OC') return `${doc.providerName} · OC ${doc.orderNumber}`;
    if (doc.entryType === 'Documento especial') return `${doc.documentType} · ${doc.providerName}`;
    if (doc.isPettyCash) return `${doc.providerName} · Caja Chica`;
    return `${doc.providerName} · Aprobó ${doc.approver ?? '—'}`;
  }

  open(doc: PortalDocument): void {
    this.resetPanel();
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
    this.resetPanel();
  }

  openPanel(panel: Panel): void {
    this.resetPanel();
    this.panel.set(panel);
    if (panel === 'observe') this.email.set(this.detail()?.providerEmail ?? '');
  }

  closePanel(): void {
    this.resetPanel();
  }

  reject(): void {
    const doc = this.detail();
    const reason = this.reason().trim();
    if (!doc) return;
    if (!reason) {
      this.reasonInvalid.set(true);
      this.panelError.set('Ingresa el motivo del rechazo.');
      return;
    }
    this.run(this.documents.reject(doc.id, reason, 'contabilidad'), (updated) => ({
      kind: 'bad',
      title: 'Documento rechazado',
      text: `El documento ${updated.number} de ${updated.providerName} pasó a estado Rechazado.`,
      reason,
      mail: `Notificamos el rechazo por correo al proveedor${updated.providerEmail ? ` (${updated.providerEmail})` : ''}.`,
    }));
  }

  observe(): void {
    const doc = this.detail();
    const reason = this.reason().trim();
    const email = this.email().trim();
    if (!doc) return;
    this.reasonInvalid.set(!reason);
    this.emailInvalid.set(!EMAIL_PATTERN.test(email));
    if (!reason || !EMAIL_PATTERN.test(email)) {
      this.panelError.set(
        !reason
          ? 'Ingresa el motivo de la observación.'
          : 'Ingresa un correo válido para enviar la observación.',
      );
      return;
    }
    this.run(this.documents.observe(doc.id, reason, email), (updated) => ({
      kind: 'warn',
      title: 'Documento observado',
      text: `El documento ${updated.number} de ${updated.providerName} pasó a estado Observado.`,
      reason,
      mail: `Enviamos la observación a ${email}.`,
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
        this.resetPanel();
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
    this.documents.accounting(this.applied()).subscribe({
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

  private resetPanel(): void {
    this.panel.set(null);
    this.reason.set('');
    this.email.set('');
    this.panelError.set('');
    this.reasonInvalid.set(false);
    this.emailInvalid.set(false);
  }
}

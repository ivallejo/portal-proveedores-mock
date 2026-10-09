import { computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { SelectOption } from '../../../../shared/ui/select/select-option';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { DocumentInbox } from '../../application/models/document-inbox';
import { InboxFilter } from '../../application/models/inbox-filter';
import {
  DOWNLOAD_ATTACHMENT,
  GET_DOCUMENT,
  SEARCH_DOCUMENT_INBOX,
} from '../../di/documents.tokens';
import { Attachment } from '../../domain/models/attachment';
import { PortalDocument } from '../../domain/models/portal-document';
import { saveBlob } from '../browser/save-blob';

const DEFAULT_FILTER: InboxFilter = { ruc: '', status: '' };

const PAGE_SIZE = 10;

/**
 * Lo común de las bandejas (Documentos por aprobar y Contabilización): filtros, listado paginado, detalle,
 * descarga de adjuntos y la ejecución de una acción sobre el documento abierto. Cada bandeja define sus acciones.
 * Los componentes compartidos (filtros y tabla) inyectan esta clase.
 */
export abstract class DocumentInboxFacade<TResult = unknown> {
  private readonly searchInbox = inject(SEARCH_DOCUMENT_INBOX);
  private readonly getDocument = inject(GET_DOCUMENT);
  private readonly downloadAttachment = inject(DOWNLOAD_ATTACHMENT);
  protected readonly toast = inject(ToastService);

  protected abstract readonly inbox: DocumentInbox;
  abstract readonly statusOptions: SelectOption[];

  readonly draft = signal<InboxFilter>({ ...DEFAULT_FILTER });
  readonly applied = signal<InboxFilter>({ ...DEFAULT_FILTER });
  readonly loading = signal(true);
  readonly rows = signal<PortalDocument[]>([]);
  readonly page = signal(1);

  readonly detail = signal<PortalDocument | null>(null);
  readonly detailLoading = signal(false);
  readonly busy = signal(false);
  readonly result = signal<TResult | null>(null);

  readonly pageSize = PAGE_SIZE;
  readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );

  /** Segunda línea de la fila; vacío: proveedor y RUC. */
  rowCaption(_doc: PortalDocument): string {
    return '';
  }

  setFilter<K extends keyof InboxFilter>(key: K, value: InboxFilter[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  search(): void {
    this.applied.set({ ...this.draft() });
    this.reload();
  }

  clear(): void {
    this.draft.set({ ...DEFAULT_FILTER });
    this.search();
  }

  open(doc: PortalDocument): void {
    this.resetPanels();
    this.result.set(null);
    this.detail.set(doc);
    this.detailLoading.set(true);
    this.getDocument.execute(doc.id).subscribe({
      next: (fresh) => {
        if (this.detail()?.id !== doc.id) return;
        this.detail.set(fresh);
        this.detailLoading.set(false);
      },
      error: (error) => {
        this.detail.set(null);
        this.detailLoading.set(false);
        this.toast.show(userFacingMessage(error, 'No fue posible cargar el documento.'));
      },
    });
  }

  close(): void {
    this.detail.set(null);
    this.result.set(null);
    this.resetPanels();
  }

  download(doc: PortalDocument, file: Attachment): void {
    if (!file.id) return;
    this.downloadAttachment.execute(doc.id, file.id).subscribe({
      next: (blob) => saveBlob(blob, file.name),
      error: (error) =>
        this.toast.show(userFacingMessage(error, 'No fue posible descargar el archivo.')),
    });
  }

  /** Limpia los paneles de acción del detalle. */
  protected abstract resetPanels(): void;

  /** Ejecuta una acción sobre el documento abierto, muestra el resultado y refresca el listado. */
  protected run(
    action: Observable<PortalDocument>,
    describe: (doc: PortalDocument) => TResult,
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
        this.toast.show(userFacingMessage(error, 'No fue posible completar la acción.'));
      },
    });
  }

  private reload(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.searchInbox.execute(this.inbox, this.applied()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        if (showLoading) this.page.set(1);
        this.loading.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.loading.set(false);
        this.toast.show(userFacingMessage(error, 'No fue posible cargar los documentos.'));
      },
    });
  }
}

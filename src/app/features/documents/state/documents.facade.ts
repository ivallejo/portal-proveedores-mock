import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { NavigationService, Screen } from '../../../core/navigation/navigation.service';
import { DocumentoService } from '../services/documento.service';
import { Documento } from '../../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class DocumentsFacade {
  readonly Math = Math;
  readonly auth = inject(AuthService);
  readonly documentoService = inject(DocumentoService);
  readonly navigation = inject(NavigationService);
  readonly screen = this.navigation.screen;
  readonly expandedId = signal<number | null>(null);
  readonly documents = this.documentoService.documents;
  readonly filterStatus = signal('');
  readonly filterType = signal('');
  readonly documentQuery = signal('');
  readonly documentDateFrom = signal('');
  readonly documentDateTo = signal('');
  readonly documentFilters = { query: '', type: '', status: '', dateFrom: '', dateTo: '' };
  readonly documentPage = signal(1);
  readonly documentPageSize = signal(5);
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

  navigate(screen: Screen): void {
    this.navigation.goTo(screen);
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
  statusClass(status: string): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }
}

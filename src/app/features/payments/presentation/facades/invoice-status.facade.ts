import { Injectable, computed, inject, signal } from '@angular/core';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { saveBlob } from '../../../../shared/utils/save-blob.util';
import { DateRange } from '../../../../shared/ui/date-range/date-range';
import { InvoiceFilter } from '../../application/models/invoice-filter';
import { EXPORT_INVOICES, SEARCH_INVOICES } from '../../di/payments.tokens';
import { Invoice } from '../../domain/models/invoice';
import { countInStage } from '../../domain/rules/invoice-rules';
import { exportFileName } from '../../domain/rules/supplier-rules';
import { SupplierScopeFacade } from './supplier-scope.facade';

const PAGE_SIZE = 10;

/** Estado de Estado de factura: filtros, resultados de SAP, paginación e indicadores por etapa. */
@Injectable()
export class InvoiceStatusFacade {
  private readonly searchInvoices = inject(SEARCH_INVOICES);
  private readonly exportInvoices = inject(EXPORT_INVOICES);
  readonly scope = inject(SupplierScopeFacade);

  readonly draft = signal<InvoiceFilter>(this.defaults());
  readonly loading = signal(false);
  /** Ya se hizo al menos una búsqueda (antes no se muestra «sin resultados»). */
  readonly searched = signal(false);
  readonly error = signal('');
  readonly invoices = signal<Invoice[]>([]);
  readonly page = signal(1);
  /** Filtros de la última búsqueda con resultados: el Excel descarga eso, no lo que se está editando. */
  private readonly applied = signal<InvoiceFilter | null>(null);
  readonly downloading = signal(false);
  readonly canDownload = computed(
    () => !this.loading() && this.applied() !== null && this.invoices().length > 0,
  );

  readonly pageSize = PAGE_SIZE;
  readonly companyOptions = this.scope.companyOptions(
    'Todas las sociedades',
    'Mostrar facturas de todas',
  );

  readonly range = computed<DateRange>(() => ({ from: this.draft().from, to: this.draft().to }));

  readonly pageRows = computed(() =>
    this.invoices().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );

  readonly kpis = computed(() => {
    const list = this.invoices();
    return {
      total: String(list.length),
      inProgress: String(countInStage(list, 'progress')),
      issues: String(countInStage(list, 'issue')),
      paid: String(countInStage(list, 'paid')),
    };
  });

  /** El proveedor ve sus facturas al entrar; CxP y el administrador primero indican el RUC. */
  start(): void {
    if (this.scope.isProvider()) this.search();
  }

  setRange(range: DateRange): void {
    this.draft.update((draft) => ({ ...draft, from: range.from, to: range.to }));
  }

  setFilter<K extends keyof InvoiceFilter>(key: K, value: InvoiceFilter[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  search(): void {
    const filter = this.draft();
    const missing = this.scope.missingRuc(filter.ruc);
    if (missing) return this.error.set(missing);
    this.error.set('');
    this.loading.set(true);
    this.searchInvoices.execute(filter).subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.applied.set(filter);
        this.page.set(1);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        this.invoices.set([]);
        this.applied.set(null);
        this.searched.set(true);
        this.loading.set(false);
        this.error.set(
          userFacingMessage(error, 'No pudimos consultar las facturas. Inténtalo en unos minutos.'),
        );
      },
    });
  }

  clear(): void {
    this.draft.set(this.defaults());
    this.invoices.set([]);
    this.applied.set(null);
    this.searched.set(false);
    this.error.set('');
    this.start();
  }

  /** Descarga en Excel la última búsqueda. */
  download(): void {
    const filter = this.applied();
    if (!filter || this.downloading()) return;
    this.downloading.set(true);
    this.error.set('');
    const name = exportFileName('estado-de-facturas', filter.ruc || this.scope.ownRuc(), filter);
    this.exportInvoices.execute(filter).subscribe({
      next: (blob) => {
        saveBlob(blob, name);
        this.downloading.set(false);
      },
      error: (error) => {
        this.downloading.set(false);
        this.error.set(
          userFacingMessage(
            error,
            'No pudimos descargar el Excel de las facturas. Inténtalo en unos minutos.',
          ),
        );
      },
    });
  }

  private defaults(): InvoiceFilter {
    return { ruc: '', number: '', company: '', ...this.scope.defaultPeriod() };
  }
}

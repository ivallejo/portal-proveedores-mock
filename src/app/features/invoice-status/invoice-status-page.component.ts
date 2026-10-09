import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { SupplierScope } from '../../shared/data/supplier-scope';
import { apiErrorMessage } from '../../core/http/api-error-message';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import {
  CalloutComponent,
  EmptyStateComponent,
} from '../../shared/ui/feedback/feedback.components';
import { DateRange, DateRangeComponent } from '../../shared/ui/date-range/date-range.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import {
  KpiCardComponent,
  PageHeaderComponent,
  PaginationComponent,
} from '../../shared/ui/page/page.components';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { currencyTone } from '../../shared/ui/tone';
import { formatDate, money, onlyDigits } from '../../shared/utils/format';
import {
  Invoice,
  InvoiceFilters,
  InvoiceStatusService,
  invoiceStage,
  invoiceTone,
} from './invoice-status.service';

const PAGE_SIZE = 10;

/** Igual que el backend (PaymentQueryService.MaxRangeDays). */
const MAX_RANGE_DAYS = 3 * 366;

@Component({
  selector: 'app-invoice-status-page',
  imports: [
    PageHeaderComponent,
    DateRangeComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    BadgeComponent,
    IconComponent,
    SpinnerComponent,
    EmptyStateComponent,
    CalloutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-status-page.component.html',
})
export class InvoiceStatusPageComponent {
  private readonly service = inject(InvoiceStatusService);
  readonly scope = inject(SupplierScope);

  readonly draft = signal<InvoiceFilters>(this.defaults());
  readonly loading = signal(false);
  /** Ya se hizo al menos una búsqueda (antes no se muestra «sin resultados»). */
  readonly searched = signal(false);
  readonly error = signal('');
  readonly invoices = signal<Invoice[]>([]);
  readonly page = signal(1);

  readonly companyOptions = this.scope.companyOptions(
    'Todas las sociedades',
    'Mostrar facturas de todas',
  );
  readonly tone = invoiceTone;
  readonly currencyTone = currencyTone;
  readonly money = money;
  readonly formatDate = formatDate;
  readonly pageSize = PAGE_SIZE;

  readonly pageRows = computed(() =>
    this.invoices().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const list = this.invoices();
    const count = (stage: string) =>
      String(list.filter((invoice) => invoiceStage(invoice.status) === stage).length);
    return {
      total: String(list.length),
      inProgress: count('progress'),
      issues: count('issue'),
      paid: count('paid'),
    };
  });

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Consultando facturas en SAP');
    // El proveedor ve sus facturas al entrar; CxP y el administrador primero indican el RUC.
    if (this.scope.isProvider()) this.search();
  }

  /** Rango máximo de la consulta a SAP (3 años, como valida el backend). */
  readonly maxDays = MAX_RANGE_DAYS;
  readonly range = computed<DateRange>(() => ({ from: this.draft().from, to: this.draft().to }));

  setRange(range: DateRange): void {
    this.draft.update((draft) => ({ ...draft, from: range.from, to: range.to }));
  }

  setFilter<K extends keyof InvoiceFilters>(key: K, value: InvoiceFilters[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value).slice(0, 11);
    this.setFilter('ruc', input.value);
  }

  onNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 13);
    this.setFilter('number', input.value);
  }

  search(): void {
    const filters = this.draft();
    const missing = this.scope.missingRuc(filters.ruc);
    if (missing) return this.error.set(missing);
    this.error.set('');
    this.loading.set(true);
    this.service.search(filters).subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.page.set(1);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        this.invoices.set([]);
        this.searched.set(true);
        this.loading.set(false);
        this.error.set(
          apiErrorMessage(error, 'No pudimos consultar las facturas. Inténtalo en unos minutos.'),
        );
      },
    });
  }

  clear(): void {
    this.draft.set(this.defaults());
    this.invoices.set([]);
    this.searched.set(false);
    this.error.set('');
    if (this.scope.isProvider()) this.search();
  }

  private defaults(): InvoiceFilters {
    return { ruc: '', number: '', company: '', ...this.scope.defaultRange() };
  }
}

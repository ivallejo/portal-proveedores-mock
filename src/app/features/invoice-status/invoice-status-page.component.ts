import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { companyOptions } from '../../shared/data/catalog';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../shared/ui/feedback/feedback.components';
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
  INVOICE_STATUS_TONE,
  Invoice,
  InvoiceFilters,
  InvoiceStatusService,
} from './invoice-status.service';

const DEFAULT_FILTERS: InvoiceFilters = {
  ruc: '',
  number: '',
  company: '',
  from: '2026-08-01',
  to: '2026-09-30',
};
const PAGE_SIZE = 10;

@Component({
  selector: 'app-invoice-status-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    BadgeComponent,
    IconComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-status-page.component.html',
})
export class InvoiceStatusPageComponent {
  private readonly service = inject(InvoiceStatusService);

  readonly draft = signal<InvoiceFilters>({ ...DEFAULT_FILTERS });
  readonly loading = signal(true);
  readonly invoices = signal<Invoice[]>([]);
  readonly page = signal(1);

  readonly companyOptions = companyOptions('Todas las sociedades', 'Mostrar facturas de todas');
  readonly tone = INVOICE_STATUS_TONE;
  readonly currencyTone = currencyTone;
  readonly money = money;
  readonly formatDate = formatDate;
  readonly pageSize = PAGE_SIZE;

  readonly pageRows = computed(() =>
    this.invoices().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const list = this.invoices();
    const count = (statuses: string[]) =>
      String(list.filter((invoice) => statuses.includes(invoice.status)).length);
    return {
      total: String(list.length),
      inProgress: count(['Registrada', 'En revisión', 'Aprobada']),
      issues: count(['Observada', 'Rechazada']),
      paid: count(['Pagada']),
    };
  });

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Buscando facturas');
    this.search();
  }

  setFilter<K extends keyof InvoiceFilters>(key: K, value: InvoiceFilters[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value);
    this.setFilter('ruc', input.value);
  }

  onNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 13);
    this.setFilter('number', input.value);
  }

  search(): void {
    this.loading.set(true);
    this.service.search(this.draft()).subscribe((invoices) => {
      this.invoices.set(invoices);
      this.page.set(1);
      this.loading.set(false);
    });
  }

  clear(): void {
    this.draft.set({ ...DEFAULT_FILTERS });
    this.search();
  }
}

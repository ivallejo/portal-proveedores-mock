import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { companyOptions } from '../../shared/data/catalog';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../shared/ui/dialog/dialog.component';
import {
  EmptyStateComponent,
  LoadingStateComponent,
} from '../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import {
  KpiCardComponent,
  PageHeaderComponent,
  PaginationComponent,
} from '../../shared/ui/page/page.components';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { currencyTone } from '../../shared/ui/tone';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { formatDate, money, onlyDigits } from '../../shared/utils/format';
import { PaymentOrder, PaymentOrderFilters, PaymentOrdersService } from './payment-orders.service';

const DEFAULT_FILTERS: PaymentOrderFilters = {
  ruc: '',
  company: '',
  from: '2026-08-01',
  to: '2026-09-30',
};
const PAGE_SIZE = 10;

@Component({
  selector: 'app-payment-orders-page',
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
    DialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-orders-page.component.html',
})
export class PaymentOrdersPageComponent {
  private readonly service = inject(PaymentOrdersService);
  private readonly toast = inject(ToastService);

  readonly draft = signal<PaymentOrderFilters>({ ...DEFAULT_FILTERS });
  readonly loading = signal(true);
  readonly orders = signal<PaymentOrder[]>([]);
  readonly page = signal(1);
  readonly selectedNumber = signal<string | null>(null);
  readonly detail = signal<PaymentOrder | null>(null);
  readonly detailLoading = signal(false);

  readonly companyOptions = companyOptions('Todas las sociedades', 'Mostrar pagos de todas');
  readonly money = money;
  readonly formatDate = formatDate;
  readonly currencyTone = currencyTone;
  readonly pageSize = PAGE_SIZE;

  readonly pageRows = computed(() =>
    this.orders().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const sum = (currency: string) =>
      this.orders()
        .filter((order) => order.currency === currency)
        .reduce((total, order) => total + order.total, 0);
    return {
      count: String(this.orders().length),
      pen: money('PEN', sum('PEN')),
      usd: money('USD', sum('USD')),
    };
  });
  readonly detailTotals = computed(() => {
    const order = this.detail();
    if (!order) return null;
    const total = (key: 'retention' | 'detraction') =>
      order.documents.reduce((sum, doc) => sum + doc[key], 0);
    return {
      documents: `${order.documents.length} ${order.documents.length === 1 ? 'comprobante' : 'comprobantes'}`,
      retention: money(order.currency, total('retention')),
      detraction: money(order.currency, total('detraction')),
    };
  });

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Buscando órdenes de pago');
    this.search();
  }

  setFilter<K extends keyof PaymentOrderFilters>(key: K, value: PaymentOrderFilters[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value);
    this.setFilter('ruc', input.value);
  }

  search(): void {
    this.loading.set(true);
    this.service.search(this.draft()).subscribe((orders) => {
      this.orders.set(orders);
      this.page.set(1);
      this.loading.set(false);
    });
  }

  clear(): void {
    this.draft.set({ ...DEFAULT_FILTERS });
    this.search();
  }

  open(order: PaymentOrder): void {
    this.selectedNumber.set(order.number);
    this.detail.set(order);
    this.detailLoading.set(true);
    this.service.detail(order.number).subscribe((detail) => {
      if (this.selectedNumber() !== order.number) return;
      this.detail.set(detail ?? order);
      this.detailLoading.set(false);
    });
  }

  close(): void {
    this.selectedNumber.set(null);
    this.detail.set(null);
  }

  download(name: string): void {
    this.toast.download(`${name}.pdf`);
  }
}

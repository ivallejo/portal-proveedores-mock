import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../shared/ui/dialog/dialog.component';
import { EmptyStateComponent } from '../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PageHeaderComponent, PaginationComponent } from '../../shared/ui/page/page.components';
import { SelectComponent, SelectOption } from '../../shared/ui/select/select.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { addDays, currencyName, formatDate, money, onlyDigits } from '../../shared/utils/format';
import {
  PURCHASE_ORDER_FLOW,
  PURCHASE_ORDER_STATUS_TONE,
  PURCHASE_ORDER_TYPES,
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderStatus,
  PurchaseOrdersService,
} from './purchase-orders.service';

const DEFAULT_FILTERS: PurchaseOrderFilters = {
  ruc: '',
  type: '',
  status: '',
  from: '2026-08-01',
  to: '2026-09-30',
};
const PAGE_SIZE = 10;

interface TrackStep {
  label: string;
  date: string;
  state: 'done' | 'current' | 'pending';
}

@Component({
  selector: 'app-purchase-orders-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    SelectComponent,
    BadgeComponent,
    IconComponent,
    EmptyStateComponent,
    DialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-orders-page.component.html',
})
export class PurchaseOrdersPageComponent {
  private readonly service = inject(PurchaseOrdersService);
  private readonly toast = inject(ToastService);

  readonly draft = signal<PurchaseOrderFilters>({ ...DEFAULT_FILTERS });
  readonly loading = signal(true);
  readonly orders = signal<PurchaseOrder[]>([]);
  readonly page = signal(1);
  readonly selected = signal<PurchaseOrder | null>(null);

  readonly tone = PURCHASE_ORDER_STATUS_TONE;
  readonly money = money;
  readonly formatDate = formatDate;
  readonly pageSize = PAGE_SIZE;

  readonly typeOptions: SelectOption[] = [
    { value: '', label: 'Todos los tipos' },
    ...PURCHASE_ORDER_TYPES.map((type) => ({ value: type, label: type })),
  ];
  readonly statusOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    ...(Object.keys(PURCHASE_ORDER_STATUS_TONE) as PurchaseOrderStatus[]).map((status) => ({
      value: status,
      label: status,
      tone: PURCHASE_ORDER_STATUS_TONE[status],
    })),
  ];

  readonly pageRows = computed(() =>
    this.orders().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly totals = computed(() => {
    const sums = new Map<string, number>();
    for (const order of this.orders()) {
      sums.set(order.currency, (sums.get(order.currency) ?? 0) + order.amount);
    }
    return (
      [...sums.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([currency, total]) => money(currency, total))
        .join('  ·  ') || '—'
    );
  });
  readonly summary = computed(() => {
    const count = this.orders().length;
    return `${count} ${count === 1 ? 'orden' : 'órdenes'}`;
  });
  readonly detail = computed(() => {
    const order = this.selected();
    return order ? this.buildDetail(order) : null;
  });

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Buscando órdenes');
    this.search();
  }

  setFilter<K extends keyof PurchaseOrderFilters>(key: K, value: PurchaseOrderFilters[K]): void {
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

  exportExcel(): void {
    this.toast.download(`Ordenes_de_compra_${this.orders().length}_registros.xlsx`);
  }

  download(order: PurchaseOrder): void {
    this.toast.download(`${order.number}.pdf`);
  }

  private buildDetail(order: PurchaseOrder) {
    const subtotal = order.type === 'Orden de servicio' ? order.amount : order.amount / 1.18;
    const igv = order.amount - subtotal;
    const index = PURCHASE_ORDER_FLOW.indexOf(order.status);
    let steps: TrackStep[];
    if (index >= 0) {
      steps = PURCHASE_ORDER_FLOW.map((label, i) => ({
        label,
        state: i < index ? 'done' : i === index ? 'current' : 'pending',
        date: i <= index ? formatDate(addDays(order.date, i * 2)) : 'Pendiente',
      }));
    } else {
      steps = [
        { label: 'Emitida', state: 'done', date: formatDate(order.date) },
        { label: order.status, state: 'current', date: formatDate(addDays(order.date, 2)) },
      ];
    }
    return {
      order,
      currency: currencyName(order.currency),
      delivery: formatDate(addDays(order.date, 15)),
      subtotal: money(order.currency, subtotal),
      igv: money(order.currency, igv),
      total: money(order.currency, order.amount),
      igvLabel: order.type === 'Orden de servicio' ? 'IGV' : 'IGV (18%)',
      steps,
    };
  }
}

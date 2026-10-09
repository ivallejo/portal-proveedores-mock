import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { SupplierScope } from '../../shared/data/supplier-scope';
import { apiErrorMessage } from '../../core/http/api-error-message';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../shared/ui/dialog/dialog.component';
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
import { formatDate, money, nowStamp, onlyDigits } from '../../shared/utils/format';
import { PaymentOrder, PaymentOrderFilters, PaymentOrdersService } from './payment-orders.service';

const PAGE_SIZE = 10;

/** Igual que el backend (PaymentQueryService.MaxRangeDays). */
const MAX_RANGE_DAYS = 3 * 366;

@Component({
  selector: 'app-payment-orders-page',
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
    DialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-orders-page.component.html',
})
export class PaymentOrdersPageComponent {
  private readonly service = inject(PaymentOrdersService);
  readonly scope = inject(SupplierScope);

  readonly draft = signal<PaymentOrderFilters>(this.defaults());
  readonly loading = signal(false);
  /** Ya se hizo al menos una búsqueda (antes no se muestra «sin resultados»). */
  readonly searched = signal(false);
  readonly error = signal('');
  readonly orders = signal<PaymentOrder[]>([]);
  readonly page = signal(1);
  readonly detail = signal<PaymentOrder | null>(null);

  readonly companyOptions = this.scope.companyOptions(
    'Todas las sociedades',
    'Mostrar pagos de todas',
  );
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
    inject(PageLoadingService).bind(this.loading, 'Consultando pagos en SAP');
    // El proveedor ve sus pagos al entrar; CxP y el administrador primero indican el RUC.
    if (this.scope.isProvider()) this.search();
  }

  /** Rango máximo de la consulta a SAP (3 años, como valida el backend). */
  readonly maxDays = MAX_RANGE_DAYS;
  readonly range = computed<DateRange>(() => ({ from: this.draft().from, to: this.draft().to }));

  setRange(range: DateRange): void {
    this.draft.update((draft) => ({ ...draft, from: range.from, to: range.to }));
  }

  setFilter<K extends keyof PaymentOrderFilters>(key: K, value: PaymentOrderFilters[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value).slice(0, 11);
    this.setFilter('ruc', input.value);
  }

  search(): void {
    const filters = this.draft();
    const missing = this.scope.missingRuc(filters.ruc);
    if (missing) return this.error.set(missing);
    this.error.set('');
    this.loading.set(true);
    this.service.search(filters).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.page.set(1);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        this.orders.set([]);
        this.searched.set(true);
        this.loading.set(false);
        this.error.set(
          apiErrorMessage(error, 'No pudimos consultar los pagos. Inténtalo en unos minutos.'),
        );
      },
    });
  }

  clear(): void {
    this.draft.set(this.defaults());
    this.orders.set([]);
    this.searched.set(false);
    this.error.set('');
    if (this.scope.isProvider()) this.search();
  }

  /** Fecha y hora que se imprime en el detalle. */
  readonly printedAt = signal('');

  /** Imprime el detalle de la orden (desde la ventana de impresión también se guarda como PDF). */
  print(): void {
    this.printedAt.set(nowStamp());
    // Se espera un ciclo para que la fecha se pinte antes de abrir la impresión.
    setTimeout(() => window.print());
  }

  /** Desde el listado: abre la orden solo para imprimirla y la cierra al terminar. */
  printOrder(order: PaymentOrder): void {
    this.open(order);
    window.addEventListener('afterprint', () => this.close(), { once: true });
    this.print();
  }

  open(order: PaymentOrder): void {
    this.detail.set(order);
  }

  close(): void {
    this.detail.set(null);
  }

  private defaults(): PaymentOrderFilters {
    return { ruc: '', company: '', ...this.scope.defaultRange() };
  }
}

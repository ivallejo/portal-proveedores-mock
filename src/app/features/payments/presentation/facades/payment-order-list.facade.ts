import { Injectable, computed, inject, signal } from '@angular/core';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { DateRange } from '../../../../shared/ui/date-range/date-range';
import { nowStamp } from '../../../../shared/utils/date-format.util';
import { money } from '../../../../shared/utils/money-format.util';
import { PaymentOrderFilter } from '../../application/models/payment-order-filter';
import { SEARCH_PAYMENT_ORDERS } from '../../di/payments.tokens';
import { PaymentOrder } from '../../domain/models/payment-order';
import { totalPaidIn, withheldTotal } from '../../domain/rules/payment-order-rules';
import { SupplierScopeFacade } from './supplier-scope.facade';

const PAGE_SIZE = 10;

/** Estado de Orden de pago: filtros, resultados de SAP, paginación, indicadores y la orden abierta. */
@Injectable()
export class PaymentOrderListFacade {
  private readonly searchPaymentOrders = inject(SEARCH_PAYMENT_ORDERS);
  readonly scope = inject(SupplierScopeFacade);

  readonly draft = signal<PaymentOrderFilter>(this.defaults());
  readonly loading = signal(false);
  /** Ya se hizo al menos una búsqueda (antes no se muestra «sin resultados»). */
  readonly searched = signal(false);
  readonly error = signal('');
  readonly orders = signal<PaymentOrder[]>([]);
  readonly page = signal(1);
  readonly detail = signal<PaymentOrder | null>(null);
  /** Fecha y hora que se imprime en el detalle. */
  readonly printedAt = signal('');

  readonly pageSize = PAGE_SIZE;
  readonly companyOptions = this.scope.companyOptions(
    'Todas las sociedades',
    'Mostrar pagos de todas',
  );

  readonly range = computed<DateRange>(() => ({ from: this.draft().from, to: this.draft().to }));

  readonly pageRows = computed(() =>
    this.orders().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );

  readonly kpis = computed(() => ({
    count: String(this.orders().length),
    pen: money('PEN', totalPaidIn(this.orders(), 'PEN')),
    usd: money('USD', totalPaidIn(this.orders(), 'USD')),
  }));

  readonly detailTotals = computed(() => {
    const order = this.detail();
    if (!order) return null;
    return {
      documents: `${order.documents.length} ${order.documents.length === 1 ? 'comprobante' : 'comprobantes'}`,
      retention: money(order.currency, withheldTotal(order, 'retention')),
      detraction: money(order.currency, withheldTotal(order, 'detraction')),
    };
  });

  /** El proveedor ve sus pagos al entrar; CxP y el administrador primero indican el RUC. */
  start(): void {
    if (this.scope.isProvider()) this.search();
  }

  setRange(range: DateRange): void {
    this.draft.update((draft) => ({ ...draft, from: range.from, to: range.to }));
  }

  setFilter<K extends keyof PaymentOrderFilter>(key: K, value: PaymentOrderFilter[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  search(): void {
    const filter = this.draft();
    const missing = this.scope.missingRuc(filter.ruc);
    if (missing) return this.error.set(missing);
    this.error.set('');
    this.loading.set(true);
    this.searchPaymentOrders.execute(filter).subscribe({
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
          userFacingMessage(error, 'No pudimos consultar los pagos. Inténtalo en unos minutos.'),
        );
      },
    });
  }

  clear(): void {
    this.draft.set(this.defaults());
    this.orders.set([]);
    this.searched.set(false);
    this.error.set('');
    this.start();
  }

  open(order: PaymentOrder): void {
    this.detail.set(order);
  }

  close(): void {
    this.detail.set(null);
  }

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

  private defaults(): PaymentOrderFilter {
    return { ruc: '', company: '', ...this.scope.defaultPeriod() };
  }
}

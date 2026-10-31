import { Injectable, computed, inject, signal } from '@angular/core';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { saveBlob } from '../../../../shared/utils/save-blob.util';
import { DateRange } from '../../../../shared/ui/date-range/date-range';
import { money } from '../../../../shared/utils/money-format.util';
import { PaymentOrderFilter } from '../../application/models/payment-order-filter';
import { EXPORT_PAYMENT_ORDERS, SEARCH_PAYMENT_ORDERS } from '../../di/payments.tokens';
import { PaymentOrder } from '../../domain/models/payment-order';
import { totalPaidIn, withheldTotal } from '../../domain/rules/payment-order-rules';
import { exportFileName } from '../../domain/rules/supplier-rules';
import { SupplierScopeFacade } from './supplier-scope.facade';

const PAGE_SIZE = 10;

/** Estado de Orden de pago: filtros, resultados de SAP, paginación, indicadores y la orden abierta. */
@Injectable()
export class PaymentOrderListFacade {
  private readonly searchPaymentOrders = inject(SEARCH_PAYMENT_ORDERS);
  private readonly exportPaymentOrders = inject(EXPORT_PAYMENT_ORDERS);
  readonly scope = inject(SupplierScopeFacade);

  readonly draft = signal<PaymentOrderFilter>(this.defaults());
  readonly loading = signal(false);
  /** Ya se hizo al menos una búsqueda (antes no se muestra «sin resultados»). */
  readonly searched = signal(false);
  readonly error = signal('');
  readonly orders = signal<PaymentOrder[]>([]);
  readonly page = signal(1);
  /** Filtros de la última búsqueda con resultados: el Excel descarga eso, no lo que se está editando. */
  private readonly applied = signal<PaymentOrderFilter | null>(null);
  readonly downloading = signal(false);
  readonly canDownload = computed(
    () => !this.loading() && this.applied() !== null && this.orders().length > 0,
  );
  readonly detail = signal<PaymentOrder | null>(null);
  /** Orden abierta en la vista previa del PDF. */
  readonly pdf = signal<PaymentOrder | null>(null);

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
        this.applied.set(filter);
        this.page.set(1);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        this.orders.set([]);
        this.applied.set(null);
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
    this.applied.set(null);
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

  /** Abre la vista previa del PDF (A4) de la orden, desde el listado o desde su detalle. */
  openPdf(order: PaymentOrder): void {
    this.pdf.set(order);
  }

  closePdf(): void {
    this.pdf.set(null);
  }

  /** Descarga en Excel la última búsqueda. */
  download(): void {
    const filter = this.applied();
    if (!filter || this.downloading()) return;
    this.downloading.set(true);
    this.error.set('');
    const name = exportFileName('ordenes-de-pago', filter.ruc || this.scope.ownRuc(), filter);
    this.exportPaymentOrders.execute(filter).subscribe({
      next: (blob) => {
        saveBlob(blob, name);
        this.downloading.set(false);
      },
      error: (error) => {
        this.downloading.set(false);
        this.error.set(
          userFacingMessage(
            error,
            'No pudimos descargar el Excel de los pagos. Inténtalo en unos minutos.',
          ),
        );
      },
    });
  }

  private defaults(): PaymentOrderFilter {
    return { ruc: '', company: '', ...this.scope.defaultPeriod() };
  }
}

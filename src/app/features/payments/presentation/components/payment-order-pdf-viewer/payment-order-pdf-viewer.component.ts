import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { nowStamp } from '../../../../../shared/utils/date-format.util';
import { PaymentOrder } from '../../../domain/models/payment-order';
import { PaymentOrderPdfSheetComponent } from '../payment-order-pdf-sheet/payment-order-pdf-sheet.component';

/** Niveles de zoom de la vista previa; el índice 3 (95 %) es el de «Ajustar» en escritorio. */
const ZOOM = [0.5, 0.67, 0.8, 0.95, 1.1, 1.25, 1.5];
/** Ancho de la hoja A4 a 96 ppp. */
const SHEET_WIDTH = 794;

/**
 * Vista previa del PDF de una orden de pago (prototipo «PDF Orden de pago · Corporativa»).
 * Imprimir y «Descargar PDF» abren la impresión del navegador, donde se elige «Guardar como PDF»;
 * el título del documento pasa a `OP-<número>` para que ese sea el nombre del archivo.
 * Se monta en `<body>` para que al imprimir solo salga la hoja (ver `@media print` en styles.css).
 */
@Component({
  selector: 'app-payment-order-pdf-viewer',
  imports: [IconComponent, PaymentOrderPdfSheetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './payment-order-pdf-viewer.component.html',
})
export class PaymentOrderPdfViewerComponent {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly order = input.required<PaymentOrder>();
  readonly closed = output<void>();

  readonly generatedAt = signal(nowStamp());
  readonly zoomIndex = signal(this.fitIndex());
  readonly zoom = computed(() => ZOOM[this.zoomIndex()]);
  readonly zoomLabel = computed(() => `${Math.round(this.zoom() * 100)} %`);
  readonly canZoomIn = computed(() => this.zoomIndex() < ZOOM.length - 1);
  readonly canZoomOut = computed(() => this.zoomIndex() > 0);
  readonly fileName = computed(() => `OP-${this.order().number}.pdf`);

  constructor() {
    const body = this.document.body;
    const overflow = body.style.overflow;
    body.style.overflow = 'hidden';
    afterNextRender(() => body.appendChild(this.host.nativeElement));
    // Escape cierra solo la vista previa (el detalle de la orden, si está abierto, sigue abierto).
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      this.closed.emit();
    };
    this.document.defaultView?.addEventListener('keydown', onKey, true);
    inject(DestroyRef).onDestroy(() => {
      this.document.defaultView?.removeEventListener('keydown', onKey, true);
      body.style.overflow = overflow;
    });
  }

  zoomIn(): void {
    if (this.canZoomIn()) this.zoomIndex.update((index) => index + 1);
  }

  zoomOut(): void {
    if (this.canZoomOut()) this.zoomIndex.update((index) => index - 1);
  }

  fit(): void {
    this.zoomIndex.set(this.fitIndex());
  }

  /** Abre la impresión del navegador; desde ahí también se guarda como PDF. */
  print(): void {
    const title = this.document.title;
    this.generatedAt.set(nowStamp());
    this.document.title = this.fileName().replace(/\.pdf$/, '');
    const restore = () => (this.document.title = title);
    this.document.defaultView?.addEventListener('afterprint', restore, { once: true });
    // Se espera un ciclo para que la fecha de generación se pinte antes de imprimir.
    setTimeout(() => this.document.defaultView?.print());
  }

  /** El mayor zoom (hasta 95 %) con el que la hoja entra a lo ancho de la ventana. */
  private fitIndex(): number {
    const width = (this.document.defaultView?.innerWidth ?? 1440) - 32;
    let index = 0;
    ZOOM.forEach((zoom, i) => {
      if (zoom <= 0.95 && SHEET_WIDTH * zoom <= width) index = i;
    });
    return index;
  }
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { money } from '../../../../../shared/utils/money-format.util';
import { PaymentOrder } from '../../../domain/models/payment-order';
import { amountInWords } from '../../../domain/rules/amount-in-words';
import { grossTotal, withheldTotal } from '../../../domain/rules/payment-order-rules';

/**
 * Hoja A4 (794 × 1123 px a 96 ppp) de la orden de pago, diseño «Corporativa» del prototipo.
 * Solo muestra lo que entrega SAP: sin dirección de la sociedad, hora, CCI, operación ni QR.
 */
@Component({
  selector: 'app-payment-order-pdf-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './payment-order-pdf-sheet.component.html',
})
export class PaymentOrderPdfSheetComponent {
  readonly order = input.required<PaymentOrder>();
  /** «dd/mm/aaaa · hh:mm» en que se generó el documento. */
  readonly generatedAt = input.required<string>();

  readonly money = money;
  readonly formatDate = formatDate;

  readonly currencyLabel = computed(() =>
    this.order().currency === 'USD' ? 'USD · Dólares' : 'PEN · Soles',
  );

  readonly totals = computed(() => {
    const order = this.order();
    return {
      gross: grossTotal(order),
      retention: withheldTotal(order, 'retention'),
      detraction: withheldTotal(order, 'detraction'),
      words: amountInWords(order.total, order.currency),
    };
  });

  /** Comprobantes de retención emitidos, uno por comprobante retenido. */
  readonly retentions = computed(() =>
    this.order().documents.filter((doc) => doc.retentionDocument),
  );

  /** Constancias de depósito de detracción (Banco de la Nación). */
  readonly detractions = computed(() =>
    this.order().documents.filter((doc) => doc.detractionCertificate),
  );
}

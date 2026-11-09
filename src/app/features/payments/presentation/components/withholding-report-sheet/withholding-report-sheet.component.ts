import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { money } from '../../../../../shared/utils/money-format.util';
import { Currency } from '../../../domain/models/currency';
import { WithholdingReport } from '../../../domain/models/withholding-report';
import { PaymentPdfHeaderComponent } from '../payment-pdf-header/payment-pdf-header.component';

/**
 * Hoja A4 (794 × 1123 px a 96 ppp) del informe de detracciones o de retenciones.
 * Es informativa, no reemplaza la constancia ni el comprobante oficial. Solo muestra lo que entrega
 * SAP: sin código de verificación ni QR, y con «—» en los campos sin dato (spec 011, C-002).
 */
@Component({
  selector: 'app-withholding-report-sheet',
  imports: [PaymentPdfHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './withholding-report-sheet.component.html',
})
export class WithholdingReportSheetComponent {
  readonly report = input.required<WithholdingReport>();
  /** «dd/mm/aaaa · hh:mm» en que se generó el documento. */
  readonly generatedAt = input.required<string>();

  readonly money = money;
  readonly formatDate = formatDate;

  readonly isDetraction = computed(() => this.report().kind === 'detraction');
  readonly title = computed(() =>
    this.isDetraction() ? 'INFORME DE DETRACCIONES' : 'INFORME DE RETENCIONES',
  );
  readonly payerRole = computed(() =>
    this.isDetraction() ? 'Adquiriente' : 'Agente de retención',
  );
  readonly headerDetail = computed(() => {
    const ruc = this.report().order.companyRuc;
    return ruc ? `RUC ${ruc} · ${this.payerRole()}` : this.payerRole();
  });

  /** El monto solo se muestra en la moneda de la orden: SAP no entrega el tipo de cambio. */
  inCurrency(currency: Currency, amount: number): string {
    return this.report().order.currency === currency ? money(currency, amount) : '—';
  }
}

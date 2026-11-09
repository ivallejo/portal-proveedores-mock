import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Encabezado de las hojas A4: marca, sociedad y recuadro con el tipo y número del documento. */
@Component({
  selector: 'app-payment-pdf-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './payment-pdf-header.component.html',
})
export class PaymentPdfHeaderComponent {
  readonly company = input.required<string>();
  /** Línea bajo la sociedad, p. ej. el RUC. */
  readonly detail = input<string | null>(null);
  readonly label = input.required<string>();
  readonly number = input.required<string>();
}

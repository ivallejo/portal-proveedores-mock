import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DateRangeComponent } from '../../../../../shared/ui/date-range/date-range.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { MAX_QUERY_DAYS } from '../../../domain/rules/supplier-rules';
import { normalizeRuc } from '../../../domain/rules/supplier-rules';
import { PaymentOrderListFacade } from '../../facades/payment-order-list.facade';

/** Filtros de Orden de pago: RUC (fijo para el proveedor), sociedad y fecha de pago. */
@Component({
  selector: 'app-payment-order-filters',
  imports: [DateRangeComponent, IconComponent, SelectComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './payment-order-filters.component.html',
})
export class PaymentOrderFiltersComponent {
  readonly facade = inject(PaymentOrderListFacade);
  /** Rango máximo de la consulta a SAP (3 años, como valida el backend). */
  readonly maxDays = MAX_QUERY_DAYS;

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = normalizeRuc(input.value);
    this.facade.setFilter('ruc', input.value);
  }
}

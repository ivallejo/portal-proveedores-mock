import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DateRangeComponent } from '../../../../../shared/ui/date-range/date-range.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { MAX_QUERY_DAYS } from '../../../domain/rules/supplier-rules';
import { normalizeRuc, normalizeDocumentNumber } from '../../../domain/rules/supplier-rules';
import { InvoiceStatusFacade } from '../../facades/invoice-status.facade';

/** Filtros de Estado de factura: RUC (fijo para el proveedor), comprobante, sociedad y fecha de emisión. */
@Component({
  selector: 'app-invoice-filters',
  imports: [DateRangeComponent, IconComponent, SelectComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './invoice-filters.component.html',
})
export class InvoiceFiltersComponent {
  readonly facade = inject(InvoiceStatusFacade);
  /** Rango máximo de la consulta a SAP (3 años, como valida el backend). */
  readonly maxDays = MAX_QUERY_DAYS;

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = normalizeRuc(input.value);
    this.facade.setFilter('ruc', input.value);
  }

  onNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = normalizeDocumentNumber(input.value);
    this.facade.setFilter('number', input.value);
  }
}

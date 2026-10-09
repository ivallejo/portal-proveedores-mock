import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { money } from '../../../../../shared/utils/money-format.util';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { currencyTone } from '../../../../../shared/ui/tone/currency-tone';
import { invoiceTone } from '../../catalog/invoice-tone.util';
import { InvoiceStatusFacade } from '../../facades/invoice-status.facade';

/** Listado paginado de comprobantes con su estado en SAP. */
@Component({
  selector: 'app-invoice-table',
  imports: [BadgeComponent, EmptyStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './invoice-table.component.html',
})
export class InvoiceTableComponent {
  readonly facade = inject(InvoiceStatusFacade);
  readonly money = money;
  readonly formatDate = formatDate;
  readonly currencyTone = currencyTone;
  readonly tone = invoiceTone;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { money } from '../../../../../shared/utils/money-format.util';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { currencyTone } from '../../../../../shared/ui/tone/currency-tone';
import { PaymentOrderListFacade } from '../../facades/payment-order-list.facade';

/** Listado paginado de órdenes de pago, con acciones para ver e imprimir. */
@Component({
  selector: 'app-payment-order-table',
  imports: [BadgeComponent, EmptyStateComponent, IconComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './payment-order-table.component.html',
})
export class PaymentOrderTableComponent {
  readonly facade = inject(PaymentOrderListFacade);
  readonly money = money;
  readonly formatDate = formatDate;
  readonly currencyTone = currencyTone;
}

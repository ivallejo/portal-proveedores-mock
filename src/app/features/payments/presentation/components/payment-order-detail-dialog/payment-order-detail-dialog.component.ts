import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { PaymentOrder } from '../../../domain/models/payment-order';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../../../../shared/ui/dialog/dialog.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { money } from '../../../../../shared/utils/money-format.util';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { PaymentOrderListFacade } from '../../facades/payment-order-list.facade';

/** Detalle imprimible de una orden: totales, comprobantes cancelados, retenciones y detracciones. */
@Component({
  selector: 'app-payment-order-detail-dialog',
  imports: [BadgeComponent, DialogComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './payment-order-detail-dialog.component.html',
})
export class PaymentOrderDetailDialogComponent {
  readonly facade = inject(PaymentOrderListFacade);
  readonly order = input.required<PaymentOrder>();
  readonly money = money;
  readonly formatDate = formatDate;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { KpiCardComponent } from '../../../../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { PaymentOrderDetailDialogComponent } from '../../components/payment-order-detail-dialog/payment-order-detail-dialog.component';
import { PaymentOrderFiltersComponent } from '../../components/payment-order-filters/payment-order-filters.component';
import { PaymentOrderTableComponent } from '../../components/payment-order-table/payment-order-table.component';
import { PaymentOrderListFacade } from '../../facades/payment-order-list.facade';

/** Orden de pago: pagos de SAP por sociedad, con el detalle imprimible de cada orden. */
@Component({
  selector: 'app-payment-order-list-page',
  imports: [
    PageHeaderComponent,
    CalloutComponent,
    KpiCardComponent,
    PaymentOrderFiltersComponent,
    PaymentOrderTableComponent,
    PaymentOrderDetailDialogComponent,
  ],
  providers: [PaymentOrderListFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-order-list-page.component.html',
})
export class PaymentOrderListPageComponent {
  readonly facade = inject(PaymentOrderListFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Consultando pagos en SAP');
    this.facade.start();
  }
}

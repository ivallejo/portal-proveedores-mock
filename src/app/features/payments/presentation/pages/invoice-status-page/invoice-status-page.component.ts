import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { KpiCardComponent } from '../../../../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { InvoiceFiltersComponent } from '../../components/invoice-filters/invoice-filters.component';
import { InvoiceTableComponent } from '../../components/invoice-table/invoice-table.component';
import { InvoiceStatusFacade } from '../../facades/invoice-status.facade';

/** Estado de factura: comprobantes del proveedor y su estado en SAP. */
@Component({
  selector: 'app-invoice-status-page',
  imports: [
    PageHeaderComponent,
    CalloutComponent,
    KpiCardComponent,
    IconComponent,
    SpinnerComponent,
    InvoiceFiltersComponent,
    InvoiceTableComponent,
  ],
  providers: [InvoiceStatusFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-status-page.component.html',
})
export class InvoiceStatusPageComponent {
  readonly facade = inject(InvoiceStatusFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Consultando facturas en SAP');
    this.facade.start();
  }
}

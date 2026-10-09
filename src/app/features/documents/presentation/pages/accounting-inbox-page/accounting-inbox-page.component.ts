import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { KpiCardComponent } from '../../../../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { AccountingDetailDialogComponent } from '../../components/accounting-detail-dialog/accounting-detail-dialog.component';
import { DocumentInboxFiltersComponent } from '../../components/document-inbox-filters/document-inbox-filters.component';
import { DocumentInboxTableComponent } from '../../components/document-inbox-table/document-inbox-table.component';
import { AccountingInboxFacade } from '../../facades/accounting-inbox.facade';
import { DocumentInboxFacade } from '../../facades/document-inbox.facade';

/** Contabilización: bandeja de Cuentas por pagar con el detalle de cada documento. */
@Component({
  selector: 'app-accounting-inbox-page',
  imports: [
    PageHeaderComponent,
    KpiCardComponent,
    DocumentInboxFiltersComponent,
    DocumentInboxTableComponent,
    AccountingDetailDialogComponent,
  ],
  providers: [
    AccountingInboxFacade,
    { provide: DocumentInboxFacade, useExisting: AccountingInboxFacade },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accounting-inbox-page.component.html',
})
export class AccountingInboxPageComponent {
  readonly facade = inject(AccountingInboxFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Cargando documentos');
    this.facade.start();
  }
}

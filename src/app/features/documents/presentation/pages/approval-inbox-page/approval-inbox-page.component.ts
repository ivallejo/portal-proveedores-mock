import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { KpiCardComponent } from '../../../../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { ApprovalDetailDialogComponent } from '../../components/approval-detail-dialog/approval-detail-dialog.component';
import { DocumentInboxFiltersComponent } from '../../components/document-inbox-filters/document-inbox-filters.component';
import { DocumentInboxTableComponent } from '../../components/document-inbox-table/document-inbox-table.component';
import { ApprovalInboxFacade } from '../../facades/approval-inbox.facade';
import { DocumentInboxFacade } from '../../facades/document-inbox.facade';

/** Documentos por aprobar: bandeja del aprobador con el detalle de cada documento. */
@Component({
  selector: 'app-approval-inbox-page',
  imports: [
    PageHeaderComponent,
    KpiCardComponent,
    DocumentInboxFiltersComponent,
    DocumentInboxTableComponent,
    ApprovalDetailDialogComponent,
  ],
  providers: [
    ApprovalInboxFacade,
    { provide: DocumentInboxFacade, useExisting: ApprovalInboxFacade },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './approval-inbox-page.component.html',
})
export class ApprovalInboxPageComponent {
  readonly facade = inject(ApprovalInboxFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Cargando documentos');
    this.facade.start();
  }
}

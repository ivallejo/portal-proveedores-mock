import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { ConfirmDialogComponent } from '../../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { KpiCardComponent } from '../../../../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SocietyFormDrawerComponent } from '../../components/society-form-drawer/society-form-drawer.component';
import { SocietyTableComponent } from '../../components/society-table/society-table.component';
import { SocietyListFacade } from '../../facades/society-list.facade';

/** Configuración › Sociedades: empresas del grupo, su RUC y su correo de facturación. */
@Component({
  selector: 'app-society-list-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    IconComponent,
    EmptyStateComponent,
    CalloutComponent,
    ConfirmDialogComponent,
    SocietyTableComponent,
    SocietyFormDrawerComponent,
  ],
  providers: [SocietyListFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './society-list-page.component.html',
})
export class SocietyListPageComponent {
  readonly facade = inject(SocietyListFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Cargando sociedades');
    this.facade.load();
  }
}

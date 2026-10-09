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
import { AreaFormDrawerComponent } from '../../components/area-form-drawer/area-form-drawer.component';
import { AreaTableComponent } from '../../components/area-table/area-table.component';
import { AreaListFacade } from '../../facades/area-list.facade';

/** Configuración › Áreas: unidades internas de cada sociedad. */
@Component({
  selector: 'app-area-list-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    IconComponent,
    EmptyStateComponent,
    CalloutComponent,
    ConfirmDialogComponent,
    AreaTableComponent,
    AreaFormDrawerComponent,
  ],
  providers: [AreaListFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './area-list-page.component.html',
})
export class AreaListPageComponent {
  readonly facade = inject(AreaListFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Cargando áreas');
    this.facade.load();
    this.facade.loadSocieties();
  }
}

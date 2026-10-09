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
import { RoleFormDrawerComponent } from '../../components/role-form-drawer/role-form-drawer.component';
import { RoleTableComponent } from '../../components/role-table/role-table.component';
import { RoleListFacade } from '../../facades/role-list.facade';

/** Configuración › Roles y permisos: qué opciones del menú ve (y usa) cada rol. */
@Component({
  selector: 'app-role-list-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    IconComponent,
    EmptyStateComponent,
    CalloutComponent,
    ConfirmDialogComponent,
    RoleTableComponent,
    RoleFormDrawerComponent,
  ],
  providers: [RoleListFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-list-page.component.html',
})
export class RoleListPageComponent {
  readonly facade = inject(RoleListFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Cargando roles');
    this.facade.load();
  }
}

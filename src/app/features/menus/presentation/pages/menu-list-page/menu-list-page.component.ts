import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { ConfirmDialogComponent } from '../../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { KpiCardComponent } from '../../../../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { MenuFormDrawerComponent } from '../../components/menu-form-drawer/menu-form-drawer.component';
import { MenuTableComponent } from '../../components/menu-table/menu-table.component';
import { MenuListFacade } from '../../facades/menu-list.facade';

/** Configuración › Menús: opciones del menú lateral en dos niveles, con su ruta, ícono y orden. */
@Component({
  selector: 'app-menu-list-page',
  imports: [
    PageHeaderComponent,
    KpiCardComponent,
    SelectComponent,
    IconComponent,
    EmptyStateComponent,
    CalloutComponent,
    ConfirmDialogComponent,
    MenuTableComponent,
    MenuFormDrawerComponent,
  ],
  providers: [MenuListFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-list-page.component.html',
})
export class MenuListPageComponent {
  readonly facade = inject(MenuListFacade);

  constructor() {
    inject(PageLoadingService).bind(this.facade.loading, 'Cargando menús');
    this.facade.load();
  }
}

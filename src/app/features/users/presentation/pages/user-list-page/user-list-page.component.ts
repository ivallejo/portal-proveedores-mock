import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { ConfirmDialogComponent } from '../../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { KpiCardComponent } from '../../../../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { UserFormDrawerComponent } from '../../components/user-form-drawer/user-form-drawer.component';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { UserEditorFacade } from '../../facades/user-editor.facade';
import { UserListFacade } from '../../facades/user-list.facade';

/** Configuración › Usuarios: proveedores y personal interno, su rol, correos, sociedades y seguridad. */
@Component({
  selector: 'app-user-list-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    IconComponent,
    SpinnerComponent,
    EmptyStateComponent,
    CalloutComponent,
    ConfirmDialogComponent,
    UserTableComponent,
    UserFormDrawerComponent,
  ],
  providers: [UserListFacade, UserEditorFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list-page.component.html',
})
export class UserListPageComponent {
  readonly list = inject(UserListFacade);
  readonly editor = inject(UserEditorFacade);

  constructor() {
    inject(PageLoadingService).bind(
      computed(() => this.list.loading() || this.editor.saving() || this.editor.sendingLink()),
      'Cargando usuarios',
    );
    this.list.loadCatalog();
    this.list.load();
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { menuIcon } from '../../../../menus';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { RoleListFacade } from '../../facades/role-list.facade';

/** Panel lateral para crear o editar un rol y elegir sus opciones del menú. */
@Component({
  selector: 'app-role-form-drawer',
  imports: [CalloutComponent, DrawerComponent, IconComponent, SelectComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-form-drawer.component.html',
})
export class RoleFormDrawerComponent {
  readonly facade = inject(RoleListFacade);
  readonly icon = menuIcon;
}

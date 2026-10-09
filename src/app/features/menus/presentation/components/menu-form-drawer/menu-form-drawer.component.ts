import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { isProtectedMenu } from '../../../domain/rules/menu-rules';
import { menuIcon } from '../../catalog/menu-icon.util';
import { MenuListFacade } from '../../facades/menu-list.facade';

/** Panel lateral para crear o editar una opción del menú. */
@Component({
  selector: 'app-menu-form-drawer',
  imports: [CalloutComponent, DrawerComponent, IconComponent, SelectComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-form-drawer.component.html',
})
export class MenuFormDrawerComponent {
  readonly facade = inject(MenuListFacade);
  readonly icon = menuIcon;
  readonly isProtected = isProtectedMenu;
}

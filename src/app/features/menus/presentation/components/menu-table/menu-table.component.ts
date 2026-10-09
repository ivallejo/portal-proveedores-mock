import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { MenuOption } from '../../../domain/models/menu-option';
import { isProtectedMenu } from '../../../domain/rules/menu-rules';
import { menuIcon } from '../../catalog/menu-icon.util';

/** Tabla jerárquica de opciones del menú: menús principales con sus submenús debajo. */
@Component({
  selector: 'app-menu-table',
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-table.component.html',
})
export class MenuTableComponent {
  readonly rows = input.required<MenuOption[]>();
  /** Todas las opciones, para contar los submenús de cada menú principal. */
  readonly menus = input.required<MenuOption[]>();
  readonly loading = input(false);
  readonly addChild = output<MenuOption>();
  readonly edit = output<MenuOption>();
  readonly toggle = output<MenuOption>();

  readonly icon = menuIcon;
  readonly isProtected = isProtectedMenu;

  childCount(menu: MenuOption): number {
    return this.menus().filter((child) => child.parentId === menu.id).length;
  }
}

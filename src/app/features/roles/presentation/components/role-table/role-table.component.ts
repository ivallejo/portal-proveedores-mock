import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { AccessRole } from '../../../domain/models/access-role';
import { PermissionOption } from '../../../domain/models/permission-option';
import { assignedMenuCount } from '../../../domain/rules/permission-rules';
import { roleTone } from '../../catalog/role-tone.util';

/** Tabla de roles con sus opciones del menú, usuarios y estado. */
@Component({
  selector: 'app-role-table',
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-table.component.html',
})
export class RoleTableComponent {
  readonly rows = input.required<AccessRole[]>();
  /** Todas las opciones del menú, para el resumen «N de M». */
  readonly menus = input.required<PermissionOption[]>();
  readonly loading = input(false);
  readonly edit = output<AccessRole>();
  readonly toggle = output<AccessRole>();

  readonly roleTone = roleTone;

  menuSummary(role: AccessRole): { count: string; caption: string } {
    const total = this.menus().length;
    const count = assignedMenuCount(role, this.menus());
    return {
      count: `${count} de ${total}`,
      caption: count === total ? 'Acceso total' : 'opciones del menú',
    };
  }
}

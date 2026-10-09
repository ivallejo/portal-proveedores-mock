import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { initials } from '../../../../../shared/utils/text-format.util';
import { UserSummary } from '../../../domain/models/user-summary';
import { USER_STATUS_LABELS } from '../../catalog/user-status-labels';
import { userRoleTone } from '../../catalog/user-role-tone.util';
import { userToggleVerb } from '../../catalog/user-toggle-verb.util';

/** Tabla de usuarios: identidad, documento, rol, área y sociedades, estado y acciones. */
@Component({
  selector: 'app-user-table',
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-table.component.html',
})
export class UserTableComponent {
  readonly rows = input.required<UserSummary[]>();
  readonly loading = input(false);
  readonly edit = output<UserSummary>();
  readonly toggle = output<UserSummary>();

  readonly statusLabels = USER_STATUS_LABELS;
  readonly initials = initials;
  readonly roleTone = userRoleTone;
  readonly toggleVerb = userToggleVerb;
}

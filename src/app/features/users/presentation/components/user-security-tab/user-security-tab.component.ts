import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { PASSWORD_LINK_STATUS_LABELS } from '../../catalog/password-link-status-labels';
import { UserEditorFacade } from '../../facades/user-editor.facade';
import { UserListFacade } from '../../facades/user-list.facade';

/** Pestaña Seguridad: cambio de contraseña en el próximo ingreso y enlaces de activación o recuperación. */
@Component({
  selector: 'app-user-security-tab',
  imports: [BadgeComponent, IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-security-tab.component.html',
})
export class UserSecurityTabComponent {
  readonly editor = inject(UserEditorFacade);
  readonly list = inject(UserListFacade);
  readonly stamp = formatDateTime;
  readonly linkStatus = PASSWORD_LINK_STATUS_LABELS;
}

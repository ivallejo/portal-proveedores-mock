import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { UserEmailType } from '../../../domain/models/user-email-type';
import { USER_EMAIL_TYPES } from '../../catalog/user-email-types';
import { UserEditorFacade } from '../../facades/user-editor.facade';
import { UserListFacade } from '../../facades/user-list.facade';

/** Pestaña Correos: agregar, elegir el principal y quitar correos. */
@Component({
  selector: 'app-user-emails-tab',
  imports: [CalloutComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-emails-tab.component.html',
})
export class UserEmailsTabComponent {
  readonly editor = inject(UserEditorFacade);
  readonly list = inject(UserListFacade);
  readonly stamp = formatDateTime;
  readonly emailTypes = USER_EMAIL_TYPES;

  emailTypeLabel(type: UserEmailType): string {
    return USER_EMAIL_TYPES.find((item) => item.value === type)?.label ?? type;
  }
}

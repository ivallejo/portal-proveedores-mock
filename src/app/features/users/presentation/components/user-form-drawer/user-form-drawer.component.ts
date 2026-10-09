import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { UserDataTabComponent } from '../user-data-tab/user-data-tab.component';
import { UserEmailsTabComponent } from '../user-emails-tab/user-emails-tab.component';
import { UserSecurityTabComponent } from '../user-security-tab/user-security-tab.component';
import { UserSocietiesTabComponent } from '../user-societies-tab/user-societies-tab.component';
import { UserEditorFacade } from '../../facades/user-editor.facade';
import { UserListFacade } from '../../facades/user-list.facade';

/** Panel lateral de alta y edición de un usuario, con sus cuatro pestañas. */
@Component({
  selector: 'app-user-form-drawer',
  imports: [
    DrawerComponent,
    IconComponent,
    SpinnerComponent,
    UserDataTabComponent,
    UserEmailsTabComponent,
    UserSocietiesTabComponent,
    UserSecurityTabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-form-drawer.component.html',
})
export class UserFormDrawerComponent {
  readonly editor = inject(UserEditorFacade);
  readonly list = inject(UserListFacade);
}

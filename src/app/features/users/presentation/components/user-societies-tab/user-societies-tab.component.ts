import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { UserEditorFacade } from '../../facades/user-editor.facade';
import { UserListFacade } from '../../facades/user-list.facade';

/** Pestaña Sociedades: con qué sociedades trabaja el usuario. */
@Component({
  selector: 'app-user-societies-tab',
  imports: [CalloutComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-societies-tab.component.html',
})
export class UserSocietiesTabComponent {
  readonly editor = inject(UserEditorFacade);
  readonly list = inject(UserListFacade);
}

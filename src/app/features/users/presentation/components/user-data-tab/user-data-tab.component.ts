import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { UserEditorFacade } from '../../facades/user-editor.facade';
import { UserListFacade } from '../../facades/user-list.facade';

/** Pestaña Datos: rol, identidad (RUC o DNI), nombres, área, estado y fechas. */
@Component({
  selector: 'app-user-data-tab',
  imports: [SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-data-tab.component.html',
})
export class UserDataTabComponent {
  readonly editor = inject(UserEditorFacade);
  readonly list = inject(UserListFacade);
  readonly stamp = formatDateTime;
}

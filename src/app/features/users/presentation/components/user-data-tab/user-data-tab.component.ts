import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { UserEditorFacade } from '../../facades/user-editor.facade';
import { UserListFacade } from '../../facades/user-list.facade';

/** Pestaña Datos: rol, identidad (RUC o DNI), nombres, área, estado y fechas. */
@Component({
  selector: 'app-user-data-tab',
  imports: [CalloutComponent, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Separa la grilla de campos del historial del registro.
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './user-data-tab.component.html',
})
export class UserDataTabComponent {
  readonly editor = inject(UserEditorFacade);
  readonly list = inject(UserListFacade);
  readonly stamp = formatDateTime;
}

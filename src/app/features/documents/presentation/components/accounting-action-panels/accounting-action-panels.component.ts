import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AccountingInboxFacade } from '../../facades/accounting-inbox.facade';

/** Paneles para rechazar u observar el documento (con el correo del proveedor). */
@Component({
  selector: 'app-accounting-action-panels',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './accounting-action-panels.component.html',
})
export class AccountingActionPanelsComponent {
  readonly facade = inject(AccountingInboxFacade);
}

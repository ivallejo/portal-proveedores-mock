import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { ApprovalInboxFacade } from '../../facades/approval-inbox.facade';

/** Paneles para aprobar (con N° de pedido o de viaje), reasignar o rechazar el documento. */
@Component({
  selector: 'app-approval-action-panels',
  imports: [IconComponent, SelectComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './approval-action-panels.component.html',
})
export class ApprovalActionPanelsComponent {
  readonly facade = inject(ApprovalInboxFacade);

  onReference(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 20);
    this.facade.setReference(input.value);
  }
}

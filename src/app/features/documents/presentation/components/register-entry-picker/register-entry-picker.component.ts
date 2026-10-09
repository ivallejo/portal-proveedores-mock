import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Tarjetas para elegir el tipo de ingreso: con OC, sin OC o documento especial. */
@Component({
  selector: 'app-register-entry-picker',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-entry-picker.component.html',
})
export class RegisterEntryPickerComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

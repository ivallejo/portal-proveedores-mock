import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Pasos del registro y su estado. */
@Component({
  selector: 'app-register-stepper',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-stepper.component.html',
})
export class RegisterStepperComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { ResultStateComponent } from '../../../../../shared/ui/result-state/result-state.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Resultado final del registro, con los datos del documento y el siguiente paso. */
@Component({
  selector: 'app-register-result',
  imports: [IconComponent, ResultStateComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-result.component.html',
})
export class RegisterResultComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

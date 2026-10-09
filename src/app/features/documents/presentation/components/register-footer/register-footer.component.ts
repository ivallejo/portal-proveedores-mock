import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Barra inferior: volver o limpiar, error del formulario y siguiente o registrar. */
@Component({
  selector: 'app-register-footer',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-footer.component.html',
})
export class RegisterFooterComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

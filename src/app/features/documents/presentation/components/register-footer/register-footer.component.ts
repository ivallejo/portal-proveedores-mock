import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Pie del registro: requisitos cumplidos («Faltan N pasos»), qué falta, Cancelar y Registrar documento. */
@Component({
  selector: 'app-register-footer',
  imports: [IconComponent, RouterLink, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-footer.component.html',
})
export class RegisterFooterComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

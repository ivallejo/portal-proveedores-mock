import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Número y título de una sección del formulario de registro. */
@Component({
  selector: 'app-register-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-section-title.component.html',
})
export class RegisterSectionTitleComponent {
  readonly n = input.required<number>();
  readonly heading = input.required<string>();
  readonly sub = input('');
}

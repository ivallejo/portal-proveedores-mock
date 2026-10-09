import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Campo de contraseña con ícono de candado y botón para mostrarla. */
@Component({
  selector: 'app-password-field',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-2' },
  templateUrl: './password-field.component.html',
})
export class PasswordFieldComponent {
  readonly inputId = input.required<string>();
  readonly label = input('Contraseña');
  readonly placeholder = input('Ingresa tu contraseña');
  readonly autocomplete = input('current-password');
  readonly invalid = input(false);
  readonly value = model('');
  readonly visible = model(false);
}

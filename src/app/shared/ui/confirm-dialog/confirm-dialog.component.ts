import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FocusTrapDirective } from '../focus-trap/focus-trap.directive';
import { IconComponent } from '../icon/icon.component';
import { SpinnerComponent } from '../spinner/spinner.component';

/** Confirmación breve (activar / desactivar), con el botón principal en rojo si es destructiva. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [FocusTrapDirective, IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Al cerrarse, Angular espera la salida animada (ver `.animate-leave` en src/styles/m3-tokens.css).
    'animate.leave': 'animate-leave',
    '(document:keydown.escape)': '!busy() && cancel.emit()',
  },
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  readonly heading = input.required<string>();
  readonly text = input('');
  readonly confirmText = input('Confirmar');
  readonly danger = input(false);
  readonly busy = input(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}

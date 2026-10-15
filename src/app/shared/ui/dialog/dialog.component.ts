import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { FocusTrapDirective } from '../focus-trap/focus-trap.directive';
import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/**
 * Ventana modal del portal: fondo azul translúcido y panel blanco centrado.
 * Proyecta el cuerpo y, con el atributo `dialog-footer`, la barra inferior.
 */
@Component({
  selector: 'app-dialog',
  imports: [FocusTrapDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Al cerrarse, Angular espera la salida animada (ver `.animate-leave` en src/styles/m3-tokens.css).
    'animate.leave': 'animate-leave',
    '(document:keydown.escape)': 'closed.emit()',
  },
  templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly titleId = `app-dialog-title-${nextId++}`;

  readonly heading = input.required<string>();
  readonly eyebrow = input('');
  readonly subtitle = input('');
  readonly width = input(1180);
  readonly busy = input(false);
  readonly closeLabel = input('Cerrar detalle');
  readonly closed = output<void>();

  ngOnInit(): void {
    this.document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }
}

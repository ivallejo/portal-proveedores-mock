import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Barra de progreso indeterminada (debajo del encabezado). */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './progress-bar.component.html',
})
export class ProgressBarComponent {
  readonly label = input('Cargando');
}

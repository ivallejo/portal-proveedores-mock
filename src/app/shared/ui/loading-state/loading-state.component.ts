import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

/** Estado de carga centrado con puntos animados («Cargando documento…»). */
@Component({
  selector: 'app-loading-state',
  imports: [SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-state.component.html',
})
export class LoadingStateComponent {
  readonly text = input('Cargando');
  readonly height = input(420);
}

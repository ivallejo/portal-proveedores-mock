import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';

/** Lista vacía con ilustración, texto y acción para limpiar filtros. */
@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly heading = input.required<string>();
  readonly text = input('');
  readonly icon = input<IconName>('file');
  readonly actionText = input('Limpiar filtros');
  readonly action = output<void>();
}

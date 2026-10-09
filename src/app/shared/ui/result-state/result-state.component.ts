import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';
import { ResultKind } from './result-kind';

const RESULT_STYLES: Record<ResultKind, { ring: string; fill: string; icon: IconName }> = {
  ok: { ring: 'bg-success-soft', fill: 'bg-success-bright', icon: 'check' },
  bad: { ring: 'bg-[#FDE8E8]', fill: 'bg-danger', icon: 'x' },
  swap: { ring: 'bg-primary-soft', fill: 'bg-primary', icon: 'swap' },
  warn: { ring: 'bg-warning-soft', fill: 'bg-warning', icon: 'alert-triangle' },
};

/** Resultado de una acción (círculo grande con ícono, título y texto). */
@Component({
  selector: 'app-result-state',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './result-state.component.html',
})
export class ResultStateComponent {
  readonly kind = input<ResultKind>('ok');
  readonly heading = input.required<string>();
  readonly text = input('');
  readonly style = computed(() => RESULT_STYLES[this.kind()]);
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';
import { TONE_CLASSES } from '../tone/tone-classes';
import { Tone } from '../tone/tone';

/** Tarjeta de indicador (ícono de color, etiqueta y valor). */
@Component({
  selector: 'app-kpi-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card flex items-center gap-3.5 px-[18px] py-4' },
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly icon = input<IconName>('file');
  readonly tone = input<Tone>('primary');
  readonly loading = input(false);
  readonly iconClass = computed(() => TONE_CLASSES[this.tone()].icon);
}

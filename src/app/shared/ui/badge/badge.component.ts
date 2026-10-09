import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TONE_CLASSES } from '../tone/tone-classes';
import { Tone } from '../tone/tone';
import { BadgeSize } from './badge-size';

const SIZES: Record<BadgeSize, string> = {
  sm: 'h-6 px-[9px] gap-[5px]',
  md: 'h-[26px] px-2.5 gap-1.5',
  lg: 'h-7 px-[11px] gap-[7px]',
};

/** Píldora de estado/etiqueta. Con `dot` muestra el indicador de color. */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  readonly tone = input<Tone>('neutral');
  readonly size = input<BadgeSize>('md');
  readonly dot = input(false);

  readonly classes = computed(() => `${TONE_CLASSES[this.tone()].pill} ${SIZES[this.size()]}`);
  readonly dotClass = computed(() => TONE_CLASSES[this.tone()].dot);
}

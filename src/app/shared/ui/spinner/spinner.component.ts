import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SpinnerTone } from './spinner-tone';

const TONES: Record<SpinnerTone, { track: string; arc: string }> = {
  light: { track: 'rgba(255,255,255,0.35)', arc: '#FFFFFF' },
  primary: { track: '#DCE8FB', arc: '#1668E3' },
  muted: { track: 'rgba(255,255,255,0.25)', arc: '#FFFFFF' },
};

@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', role: 'presentation' },
  templateUrl: './spinner.component.html',
})
export class SpinnerComponent {
  readonly size = input(18);
  readonly tone = input<SpinnerTone>('light');
  readonly colors = computed(() => TONES[this.tone()]);
}

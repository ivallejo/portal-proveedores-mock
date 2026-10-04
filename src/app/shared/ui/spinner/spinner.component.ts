import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type SpinnerTone = 'light' | 'primary' | 'muted';

const TONES: Record<SpinnerTone, { track: string; arc: string }> = {
  light: { track: 'rgba(255,255,255,0.35)', arc: '#FFFFFF' },
  primary: { track: '#DCE8FB', arc: '#1668E3' },
  muted: { track: 'rgba(255,255,255,0.25)', arc: '#FFFFFF' },
};

@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', role: 'presentation' },
  template: `
    <svg
      class="animate-spin-fast"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" [attr.stroke]="colors().track" stroke-width="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        [attr.stroke]="colors().arc"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  `,
})
export class SpinnerComponent {
  readonly size = input(18);
  readonly tone = input<SpinnerTone>('light');
  readonly colors = computed(() => TONES[this.tone()]);
}

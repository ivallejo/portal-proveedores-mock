import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';
import { CalloutTone } from './callout-tone';

const CALLOUT_STYLES: Record<CalloutTone, { box: string; icon: IconName }> = {
  info: { box: 'bg-page text-ink-soft', icon: 'info' },
  danger: {
    box: 'border border-danger-line bg-danger-soft text-danger-deep',
    icon: 'alert-circle',
  },
  success: {
    box: 'border border-[#CDEBD8] bg-success-tint text-success-text',
    icon: 'circle-check',
  },
  warn: { box: 'bg-[#FFF6E8] text-[#7A4A00]', icon: 'alert-triangle' },
  neutral: { box: 'bg-[#F1F4F9] text-[#3B4A66]', icon: 'lock-simple' },
};

/** Recuadro de aviso (información, error, éxito). */
@Component({
  selector: 'app-callout',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './callout.component.html',
})
export class CalloutComponent {
  readonly tone = input<CalloutTone>('info');
  readonly heading = input('');
  readonly icon = input<IconName | undefined>(undefined);
  readonly style = computed(() => CALLOUT_STYLES[this.tone()]);
}

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';
import { SpinnerComponent } from '../spinner/spinner.component';

/** Barra de progreso indeterminada (debajo del encabezado). */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      role="progressbar"
      [attr.aria-label]="label()"
      class="relative h-[3px] w-full overflow-hidden bg-primary-track"
    >
      <div class="animate-bar absolute top-0 left-0 h-[3px] w-2/5 rounded-[3px] bg-primary"></div>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly label = input('Cargando');
}

/** Estado de carga centrado con puntos animados («Cargando documento…»). */
@Component({
  selector: 'app-loading-state',
  imports: [SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="status"
      class="flex flex-col items-center justify-center gap-4"
      [style.min-height.px]="height()"
    >
      <app-spinner [size]="44" tone="primary" />
      <div class="flex items-center gap-1 text-sm font-medium text-label">
        {{ text() }}<span class="dot-1">.</span><span class="dot-2">.</span
        ><span class="dot-3">.</span>
      </div>
    </div>
  `,
})
export class LoadingStateComponent {
  readonly text = input('Cargando');
  readonly height = input(420);
}

/** Lista vacía con ilustración, texto y acción para limpiar filtros. */
@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-fade flex grow flex-col items-center justify-center gap-3.5 px-6 py-14 text-center"
    >
      <span
        class="relative flex size-24 items-center justify-center rounded-full bg-page text-primary"
      >
        <app-icon [name]="icon()" [size]="40" [stroke]="1.6" />
        <span
          class="absolute right-1.5 bottom-2 flex size-[34px] items-center justify-center rounded-full bg-white text-primary shadow-[0_4px_12px_rgba(14,42,92,0.16)]"
        >
          <app-icon name="search" [size]="18" [stroke]="2" />
        </span>
      </span>
      <div class="text-lg font-bold">{{ heading() }}</div>
      <div class="max-w-[440px] text-sm leading-relaxed text-muted">{{ text() }}</div>
      @if (actionText()) {
        <button type="button" class="btn btn-outline mt-1" (click)="action.emit()">
          {{ actionText() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly heading = input.required<string>();
  readonly text = input('');
  readonly icon = input<IconName>('file');
  readonly actionText = input('Limpiar filtros');
  readonly action = output<void>();
}

type ResultKind = 'ok' | 'bad' | 'swap' | 'warn';

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
  template: `
    <div
      role="status"
      class="animate-fade flex flex-col items-center gap-4 px-5 pt-12 pb-11 text-center sm:px-8"
    >
      <span
        class="flex size-[92px] items-center justify-center rounded-full"
        [class]="style().ring"
      >
        <span
          class="animate-pop flex size-[62px] items-center justify-center rounded-full text-white"
          [class]="style().fill"
        >
          <app-icon [name]="style().icon" [size]="30" [stroke]="2.4" />
        </span>
      </span>
      <h3 class="m-0 text-[26px] font-bold tracking-tight">{{ heading() }}</h3>
      @if (text()) {
        <p class="m-0 max-w-[620px] text-[15px] leading-relaxed text-body">{{ text() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class ResultStateComponent {
  readonly kind = input<ResultKind>('ok');
  readonly heading = input.required<string>();
  readonly text = input('');
  readonly style = computed(() => RESULT_STYLES[this.kind()]);
}

type CalloutTone = 'info' | 'danger' | 'success' | 'warn' | 'neutral';

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
  template: `
    <div
      class="flex items-start gap-3 rounded-xl px-4 py-3 text-[13.5px] leading-normal"
      [class]="style().box"
      [attr.role]="tone() === 'danger' ? 'alert' : null"
    >
      <app-icon [name]="icon() ?? style().icon" [size]="20" [stroke]="1.9" class="mt-px" />
      <div class="flex min-w-0 flex-col gap-0.5">
        @if (heading()) {
          <span class="text-sm font-bold">{{ heading() }}</span>
        }
        <span><ng-content /></span>
      </div>
    </div>
  `,
})
export class CalloutComponent {
  readonly tone = input<CalloutTone>('info');
  readonly heading = input('');
  readonly icon = input<IconName | undefined>(undefined);
  readonly style = computed(() => CALLOUT_STYLES[this.tone()]);
}

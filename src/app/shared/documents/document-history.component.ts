import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../ui/icon/icon.component';
import { HistoryEvent } from './document.model';

/** Línea de tiempo del historial del documento (panel derecho del detalle). */
@Component({
  selector: 'app-document-history',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-col gap-3.5' },
  template: `
    <div class="flex items-center justify-between">
      <span class="text-base font-bold">{{ heading() }}</span>
      <span class="text-[12.5px] text-muted">{{ events().length }} eventos</span>
    </div>
    <ol
      [attr.aria-label]="heading()"
      class="m-0 flex max-h-[420px] list-none flex-col overflow-y-auto p-0"
    >
      @for (event of events(); track $index; let i = $index; let last = $last) {
        <li
          class="animate-in grid grid-cols-[28px_1fr] gap-x-3"
          [style.animation-delay.ms]="i * 60"
        >
          <div class="flex flex-col items-center">
            <span
              class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-white"
              [class]="
                event.kind === 'done'
                  ? 'border-primary bg-primary'
                  : event.kind === 'bad'
                    ? 'border-danger bg-danger'
                    : event.kind === 'warn'
                      ? 'border-warning bg-warning'
                      : 'animate-ring border-warning bg-white'
              "
            >
              @switch (event.kind) {
                @case ('done') {
                  <app-icon name="check" [size]="12" [stroke]="3" />
                }
                @case ('bad') {
                  <app-icon name="x" [size]="12" [stroke]="3" />
                }
                @case ('warn') {
                  <span class="text-xs leading-none font-bold">!</span>
                }
                @default {
                  <span class="size-2 rounded-full bg-warning"></span>
                }
              }
            </span>
            @if (!last) {
              <span
                class="my-[3px] min-h-3.5 w-0.5 grow"
                [class]="event.kind === 'current' ? 'bg-line' : 'bg-[#BCD3F7]'"
              ></span>
            }
          </div>
          <div class="flex min-w-0 flex-col gap-[3px] pb-4">
            <span
              class="text-sm font-bold"
              [class]="
                event.kind === 'bad'
                  ? 'text-[#A51E1E]'
                  : event.kind === 'current' || event.kind === 'warn'
                    ? 'text-warning-text'
                    : 'text-ink'
              "
              >{{ event.title }}</span
            >
            <span class="text-[12.5px] text-body">{{ event.who }}</span>
            <span class="text-xs text-subtle tabular-nums">{{ event.when }}</span>
            @if (event.note) {
              <span
                class="mt-1 rounded-lg border border-line bg-white px-2.5 py-2 text-[12.5px] leading-normal text-label"
                >“{{ event.note }}”</span
              >
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class DocumentHistoryComponent {
  readonly events = input<HistoryEvent[]>([]);
  readonly heading = input('Historial del documento');
}

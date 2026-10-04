import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';
import { TONE_CLASSES, Tone } from '../tone';

/** Título y descripción de una página, con acciones opcionales a la derecha. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap items-end justify-between gap-x-8 gap-y-4' },
  template: `
    <div class="flex max-w-[820px] flex-col gap-2">
      <h1 class="m-0 text-[26px] font-bold tracking-tight sm:text-[32px]">{{ heading() }}</h1>
      @if (description()) {
        <p class="m-0 text-[15px] leading-relaxed text-body">{{ description() }}</p>
      }
    </div>
    <ng-content />
  `,
})
export class PageHeaderComponent {
  readonly heading = input.required<string>();
  readonly description = input('');
}

/** Tarjeta de indicador (ícono de color, etiqueta y valor). */
@Component({
  selector: 'app-kpi-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card flex items-center gap-3.5 px-[18px] py-4' },
  template: `
    <span
      class="flex size-11 shrink-0 items-center justify-center rounded-xl"
      [class]="iconClass()"
    >
      <app-icon [name]="icon()" [size]="22" />
    </span>
    <div class="flex min-w-0 grow flex-col gap-1.5">
      <span class="text-[13px] text-muted">{{ label() }}</span>
      @if (loading()) {
        <span class="skeleton h-[22px] w-[36%]"></span>
      } @else {
        <span class="animate-fade truncate text-[22px] font-bold tabular-nums">{{ value() }}</span>
      }
    </div>
  `,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly icon = input<IconName>('file');
  readonly tone = input<Tone>('primary');
  readonly loading = input(false);
  readonly iconClass = computed(() => TONE_CLASSES[this.tone()].icon);
}

/** Pie de tabla con el resumen de resultados y la paginación. */
@Component({
  selector: 'app-pagination',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'mt-auto flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line-soft px-6 py-2.5 text-[13px] text-body',
  },
  template: `
    <span>{{ summary() }}</span>
    @if (!loading() && total() > 0) {
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-lg border border-[#DDE1E7] bg-white text-muted disabled:opacity-40"
          aria-label="Página anterior"
          [disabled]="page() === 1"
          (click)="pageChange.emit(page() - 1)"
        >
          <app-icon name="chevron-left" [size]="16" [stroke]="2" />
        </button>
        @for (item of pages(); track item) {
          <button
            type="button"
            class="size-9 rounded-lg text-[13px] font-bold"
            [class.bg-primary]="item === page()"
            [class.text-white]="item === page()"
            [class.border]="item !== page()"
            [class.border-[#DDE1E7]]="item !== page()"
            [class.bg-white]="item !== page()"
            [class.text-muted]="item !== page()"
            [attr.aria-current]="item === page() ? 'page' : null"
            (click)="pageChange.emit(item)"
          >
            {{ item }}
          </button>
        }
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-lg border border-[#DDE1E7] bg-white text-muted disabled:opacity-40"
          aria-label="Página siguiente"
          [disabled]="page() === pageCount()"
          (click)="pageChange.emit(page() + 1)"
        >
          <app-icon name="chevron-right" [size]="16" [stroke]="2" />
        </button>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly total = input(0);
  readonly page = input(1);
  readonly pageSize = input(10);
  /** Sustantivo en plural para el resumen: «documentos», «facturas»… */
  readonly noun = input('resultados');
  readonly loadingText = input('Buscando…');
  readonly loading = input(false);
  readonly pageChange = output<number>();

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));
  readonly summary = computed(() => {
    if (this.loading()) return this.loadingText();
    const total = this.total();
    if (!total) return 'Sin resultados';
    const from = (this.page() - 1) * this.pageSize() + 1;
    const to = Math.min(total, this.page() * this.pageSize());
    return `Mostrando ${from}–${to} de ${total} ${this.noun()}`;
  });
}

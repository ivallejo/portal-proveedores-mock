import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { DateRange } from './date-range';
import { addDays } from '../../utils/date-format.util';
import { DayCell } from './day-cell';
import { MonthView } from './month-view';
import { DateRangeLayout } from './date-range-layout';
import {
  MONTHS,
  WEEKDAYS,
  dateOf,
  daysBetween,
  daysLabel,
  isoOf,
  longDate,
  pad,
} from './calendar.util';

/**
 * Selector de rango de fechas (Propuesta E del prototipo): campo tipo píldora que abre un calendario con
 * atajos. Escritorio: atajos en columna y dos meses; tablet: atajos como chips y dos meses; móvil: hoja
 * inferior con un mes. Se elige la fecha inicial y luego la final; «Aplicar» confirma.
 */
@Component({
  selector: 'app-date-range',
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-col gap-2',
    '(document:keydown.escape)': 'open() && cancel()',
    '(document:mousedown)': 'onOutside($event)',
  },
  templateUrl: './date-range.component.html',
})
export class DateRangeComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private static nextId = 0;
  readonly labelId = `app-date-range-${DateRangeComponent.nextId++}`;

  readonly label = input('Rango de fechas');
  readonly placeholder = input('Selecciona un rango');
  /** Rango máximo en días (incluidos ambos extremos); 0 = sin límite. */
  readonly maxDays = input(0);
  readonly invalid = input(false);
  /** Rango aplicado (enlazable con `[(value)]`). */
  readonly value = model<DateRange>({ from: '', to: '' });

  readonly weekdays = WEEKDAYS.map((label, index) => ({ label, weekend: index >= 5 }));
  readonly open = signal(false);
  readonly draft = signal<DateRange>({ from: '', to: '' });
  readonly hover = signal('');
  /** Primer mes visible (año y mes 0-11). */
  readonly view = signal({ year: 0, month: 0 });
  readonly layout = signal<DateRangeLayout>('desktop');
  /** El panel se alinea a la derecha del campo si no cabe hacia la derecha. */
  readonly alignRight = signal(false);

  readonly today = signal(isoOf(new Date()));

  readonly hasValue = computed(() => !!this.value().from);
  readonly fromLabel = computed(() => longDate(this.value().from));
  readonly toLabel = computed(() => longDate(this.value().to || this.value().from));
  readonly appliedDays = computed(() => {
    const { from, to } = this.value();
    return from ? daysLabel(daysBetween(from, to || from)) : '';
  });

  /** Falta la fecha final (se previsualiza el rango al pasar el mouse). */
  readonly pending = computed(() => !!this.draft().from && !this.draft().to);
  readonly draftDays = computed(() => {
    const { from, to } = this.draft();
    return from && to ? daysBetween(from, to) : 0;
  });
  readonly tooLong = computed(() => this.maxDays() > 0 && this.draftDays() > this.maxDays());
  readonly canApply = computed(() => !!this.draft().from && !this.tooLong());
  readonly draftText = computed(() => {
    const { from, to } = this.draft();
    if (!from) return 'Sin fechas seleccionadas';
    return `${longDate(from)}  –  ${to ? longDate(to) : '…'}`;
  });
  readonly draftHint = computed(() => {
    if (this.tooLong()) return `Máximo ${daysLabel(this.maxDays())}`;
    if (this.draftDays()) return daysLabel(this.draftDays());
    return this.pending() ? 'Elige la fecha final' : '';
  });
  readonly fromTile = computed(() => longDate(this.draft().from) || 'Elige la fecha');
  readonly toTile = computed(() =>
    this.draft().to ? longDate(this.draft().to) : this.pending() ? 'Elige la fecha final' : '—',
  );

  readonly presets = computed(() => {
    const today = this.today();
    const now = dateOf(today);
    const monthStart = isoOf(new Date(now.getFullYear(), now.getMonth(), 1));
    const prevStart = isoOf(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const prevEnd = isoOf(new Date(now.getFullYear(), now.getMonth(), 0));
    const { from, to } = this.draft();
    return (
      [
        ['Hoy', today, today],
        ['Ayer', addDays(today, -1), addDays(today, -1)],
        ['Últimos 7 días', addDays(today, -6), today],
        ['Últimos 30 días', addDays(today, -29), today],
        ['Este mes', monthStart, today],
        ['Mes anterior', prevStart, prevEnd],
      ] as const
    ).map(([label, start, end]) => ({
      label,
      from: start,
      to: end,
      on: from === start && to === end,
    }));
  });

  readonly months = computed<MonthView[]>(() => {
    const count = this.layout() === 'mobile' ? 1 : 2;
    const { year, month } = this.view();
    return Array.from({ length: count }, (_, index) => this.buildMonth(year, month + index));
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const tablet = window.matchMedia('(min-width: 768px)');
      const desktop = window.matchMedia('(min-width: 1024px)');
      const update = () =>
        this.layout.set(desktop.matches ? 'desktop' : tablet.matches ? 'tablet' : 'mobile');
      update();
      tablet.addEventListener('change', update);
      desktop.addEventListener('change', update);
    }
    // En móvil la hoja inferior bloquea el scroll de la página.
    effect(() => {
      const lock = this.open() && this.layout() === 'mobile';
      this.document.body.style.overflow = lock ? 'hidden' : '';
    });
  }

  toggle(): void {
    if (this.open()) return this.cancel();
    this.today.set(isoOf(new Date()));
    this.draft.set({ ...this.value() });
    this.hover.set('');
    this.showMonthOf(this.value().to || this.value().from || this.today());
    this.alignRight.set(this.shouldAlignRight());
    this.open.set(true);
  }

  pick(cell: DayCell): void {
    if (cell.disabled) return;
    const { from, to } = this.draft();
    // Primera fecha, nueva selección, o una anterior a la inicial: empieza otra vez.
    if (!from || to || cell.iso < from) this.draft.set({ from: cell.iso, to: '' });
    else this.draft.set({ from, to: cell.iso });
    this.hover.set('');
  }

  enter(cell: DayCell): void {
    if (this.pending() && !cell.disabled) this.hover.set(cell.iso);
  }

  usePreset(preset: { from: string; to: string }): void {
    this.draft.set({ from: preset.from, to: preset.to });
    this.hover.set('');
    this.showMonthOf(preset.to);
  }

  previousMonth(): void {
    this.view.update(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  }

  nextMonth(): void {
    this.view.update(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );
  }

  /** No se avanza más allá del mes actual. */
  readonly canGoNext = computed(() => {
    const lastShown = this.months().at(-1)?.key ?? '';
    return lastShown < this.today().slice(0, 7);
  });

  clear(): void {
    this.draft.set({ from: '', to: '' });
    this.hover.set('');
  }

  cancel(): void {
    this.open.set(false);
    this.hover.set('');
  }

  apply(): void {
    if (!this.canApply()) return;
    const { from, to } = this.draft();
    this.value.set({ from, to: to || from });
    this.open.set(false);
    this.hover.set('');
  }

  /** En escritorio y tablet, un clic fuera cierra sin aplicar. */
  onOutside(event: MouseEvent): void {
    if (!this.open() || this.layout() === 'mobile') return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.cancel();
  }

  private showMonthOf(iso: string): void {
    const date = dateOf(iso);
    // Con dos meses, el mes de la fecha queda a la derecha.
    const offset = this.layout() === 'mobile' ? 0 : 1;
    const first = new Date(date.getFullYear(), date.getMonth() - offset, 1);
    this.view.set({ year: first.getFullYear(), month: first.getMonth() });
  }

  private shouldAlignRight(): boolean {
    if (typeof window === 'undefined' || this.layout() === 'mobile') return false;
    const panelWidth = this.layout() === 'desktop' ? 840 : 660;
    const rect = this.host.nativeElement.getBoundingClientRect();
    return rect.left + panelWidth > window.innerWidth - 16 && rect.right - panelWidth >= 16;
  }

  private buildMonth(year: number, month: number): MonthView {
    const first = new Date(year, month, 1);
    const y = first.getFullYear();
    const m = first.getMonth();
    const lead = (first.getDay() + 6) % 7;
    const length = new Date(y, m + 1, 0).getDate();
    const today = this.today();
    const { from } = this.draft();
    const hover = this.hover();
    const to = this.draft().to || (this.pending() && hover && hover >= from ? hover : '');
    const hasRange = !!from && !!to && from !== to;
    const cells: (DayCell | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let day = 1; day <= length; day++) {
      const iso = `${y}-${pad(m + 1)}-${pad(day)}`;
      const isFrom = iso === from;
      const isTo = !!to && iso === to;
      const inRange = !!from && !!to && iso > from && iso < to;
      cells.push({
        iso,
        label: longDate(iso),
        day,
        disabled: iso > today,
        isEnd: isFrom || isTo,
        inRange,
        bandLeft: inRange || (isTo && hasRange),
        bandRight: inRange || (isFrom && hasRange),
        isToday: iso === today,
        weekend: (lead + day - 1) % 7 >= 5,
      });
    }
    return {
      key: `${y}-${pad(m + 1)}`,
      title: `${MONTHS[m][0].toUpperCase()}${MONTHS[m].slice(1)} ${y}`,
      cells,
    };
  }
}

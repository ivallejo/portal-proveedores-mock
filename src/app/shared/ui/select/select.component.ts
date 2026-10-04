import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { TONE_CLASSES, Tone } from '../tone';

export interface SelectOption {
  value: string;
  label: string;
  /** Texto secundario bajo la etiqueta (por ejemplo, el RUC de una sociedad). */
  sub?: string;
  /** Muestra un punto de color antes de la etiqueta. */
  tone?: Tone;
}

let nextId = 0;

/** Desplegable con lista de opciones (listbox) al estilo del prototipo. */
@Component({
  selector: 'app-select',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-col gap-2',
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'open.set(false)',
  },
  template: `
    @if (label()) {
      <span class="field-label" [id]="labelId">{{ label() }}</span>
    }
    <button
      type="button"
      class="flex h-11 w-full items-center justify-between gap-2 rounded-[10px] border bg-white px-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      [class.border-primary]="open()"
      [class.border-[#E04848]]="!open() && invalid()"
      [class.border-field]="!open() && !invalid()"
      [class.text-ink]="!!selected()"
      [class.text-subtle]="!selected()"
      [attr.aria-labelledby]="label() ? labelId : null"
      [attr.aria-label]="label() ? null : placeholder()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [disabled]="disabled()"
      (click)="toggle()"
    >
      <span class="flex min-w-0 items-center gap-2">
        @if (selected()?.tone; as tone) {
          <span class="size-2 shrink-0 rounded-full" [class]="dotClass(tone)"></span>
        } @else if (showEmptyDot()) {
          <span class="size-2 shrink-0 rounded-full bg-[#C3C9D3]"></span>
        }
        <span class="truncate">{{ selected()?.label ?? placeholder() }}</span>
      </span>
      <app-icon name="chevron-down" [size]="18" [stroke]="2" class="text-muted" />
    </button>

    @if (open()) {
      <div
        role="listbox"
        [attr.aria-labelledby]="label() ? labelId : null"
        class="animate-pop absolute right-0 left-0 z-20 flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-xl border border-field bg-white p-1.5"
        [class.top-full]="!dropUp()"
        [class.mt-1.5]="!dropUp()"
        [class.shadow-pop]="!dropUp()"
        [class.bottom-12]="dropUp()"
        [class.shadow-pop-up]="dropUp()"
      >
        @for (option of options(); track option.value) {
          <button
            type="button"
            role="option"
            [attr.aria-selected]="option.value === value()"
            class="flex min-h-[42px] items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-ink hover:bg-primary-tint"
            [class.bg-[#EAF2FF]]="option.value === value()"
            [class.font-bold]="option.value === value()"
            [class.font-medium]="option.value !== value()"
            (click)="pick(option.value)"
          >
            <span class="flex min-w-0 items-center gap-2.5">
              @if (option.tone; as tone) {
                <span class="size-2 shrink-0 rounded-full" [class]="dotClass(tone)"></span>
              } @else if (showEmptyDot()) {
                <span class="size-2 shrink-0 rounded-full bg-[#C3C9D3]"></span>
              }
              <span class="flex min-w-0 flex-col gap-px">
                <span>{{ option.label }}</span>
                @if (option.sub) {
                  <span class="text-xs font-normal text-muted">{{ option.sub }}</span>
                }
              </span>
            </span>
            @if (option.value === value()) {
              <app-icon name="check" [size]="16" [stroke]="2.4" class="text-primary" />
            }
          </button>
        } @empty {
          <span class="px-2.5 py-2 text-sm text-muted">{{ emptyText() }}</span>
        }
      </div>
    }
  `,
})
export class SelectComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly labelId = `app-select-${nextId++}`;

  readonly options = input<SelectOption[]>([]);
  readonly value = model('');
  readonly label = input('');
  readonly placeholder = input('Selecciona una opción');
  readonly emptyText = input('No hay opciones disponibles');
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly dropUp = input(false);
  /** Muestra un punto gris cuando la opción no tiene tono (filtros de estado). */
  readonly showEmptyDot = input(false);

  readonly open = signal(false);
  readonly selected = computed(() =>
    this.options().find((option) => option.value === this.value()),
  );

  toggle(): void {
    this.open.update((open) => !open);
  }

  pick(value: string): void {
    this.value.set(value);
    this.open.set(false);
  }

  dotClass(tone: Tone): string {
    return TONE_CLASSES[tone].dot;
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}

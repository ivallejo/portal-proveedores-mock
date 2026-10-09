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
import { TONE_CLASSES } from '../tone/tone-classes';
import { Tone } from '../tone/tone';
import { SelectOption } from './select-option';

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
  templateUrl: './select.component.html',
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

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Título y descripción de una página, con acciones opcionales a la derecha. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap items-end justify-between gap-x-8 gap-y-4' },
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  readonly heading = input.required<string>();
  readonly description = input('');
}

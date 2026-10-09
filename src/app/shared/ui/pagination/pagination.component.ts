import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Pie de tabla con el resumen de resultados y la paginación. */
@Component({
  selector: 'app-pagination',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'mt-auto flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line-soft px-6 py-2.5 text-[13px] text-body',
  },
  templateUrl: './pagination.component.html',
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

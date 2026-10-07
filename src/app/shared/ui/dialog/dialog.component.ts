import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/**
 * Ventana modal del portal: fondo azul translúcido y panel blanco centrado.
 * Proyecta el cuerpo y, con el atributo `dialog-footer`, la barra inferior.
 */
@Component({
  selector: 'app-dialog',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div
      class="animate-fade fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-[rgba(14,42,92,0.55)] px-3 py-6 sm:px-6 sm:pt-16 print:static print:block print:overflow-visible print:bg-transparent print:p-0"
      (click)="onBackdrop($event)"
    >
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-busy]="busy()"
        class="animate-pop flex w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-dialog print:max-w-none! print:animate-none print:rounded-none print:shadow-none"
        [style.max-width.px]="width()"
      >
        <div
          class="flex items-start justify-between gap-6 border-b border-line-soft px-5 pt-6 pb-5 sm:px-8"
        >
          <div class="flex min-w-0 flex-col gap-2">
            @if (eyebrow()) {
              <div class="text-xs font-bold tracking-widest text-primary uppercase">
                {{ eyebrow() }}
              </div>
            }
            <ng-content select="[dialog-tags]" />
            <div class="flex flex-wrap items-center gap-3.5">
              <h2
                [id]="titleId"
                class="m-0 text-[22px] font-bold tracking-tight tabular-nums sm:text-[26px]"
              >
                {{ heading() }}
              </h2>
              <ng-content select="[dialog-status]" />
            </div>
            @if (subtitle()) {
              <div class="text-sm text-body">{{ subtitle() }}</div>
            }
          </div>
          <button
            type="button"
            class="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-label hover:bg-line print:hidden"
            [attr.aria-label]="closeLabel()"
            (click)="closed.emit()"
          >
            <app-icon name="x" [size]="20" [stroke]="2" />
          </button>
        </div>

        <ng-content />

        <ng-content select="[dialog-footer]" />
      </div>
    </div>
  `,
})
export class DialogComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly titleId = `app-dialog-title-${nextId++}`;

  readonly heading = input.required<string>();
  readonly eyebrow = input('');
  readonly subtitle = input('');
  readonly width = input(1180);
  readonly busy = input(false);
  readonly closeLabel = input('Cerrar detalle');
  readonly closed = output<void>();

  ngOnInit(): void {
    this.document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }
}

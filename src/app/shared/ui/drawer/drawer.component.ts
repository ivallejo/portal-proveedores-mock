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
import { IconName } from '../icon/icons';

let nextId = 0;

/**
 * Panel lateral derecho de Configuración (crear / editar). Proyecta pestañas con `drawer-tabs`,
 * el cuerpo y la barra inferior con `drawer-footer`.
 */
@Component({
  selector: 'app-drawer',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div
      class="animate-fade fixed inset-0 z-40 flex justify-end bg-[rgba(14,42,92,0.45)]"
      (click)="onBackdrop($event)"
    >
      <aside
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        class="animate-in flex h-full w-full max-w-[640px] flex-col bg-white shadow-[-24px_0_60px_rgba(14,42,92,0.25)]"
      >
        <div
          class="flex items-start justify-between gap-4 border-b border-line-soft px-5 pt-6 pb-[18px] sm:px-7"
        >
          <div class="flex min-w-0 items-center gap-3.5">
            <span
              class="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary"
            >
              <app-icon [name]="icon()" [size]="22" />
            </span>
            <div class="flex min-w-0 flex-col gap-[3px]">
              <h2 [id]="titleId" class="m-0 text-[22px] font-bold tracking-tight">
                {{ heading() }}
              </h2>
              @if (subtitle()) {
                <span class="truncate text-[13.5px] text-body">{{ subtitle() }}</span>
              }
            </div>
          </div>
          <button
            type="button"
            class="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-label hover:bg-line"
            aria-label="Cerrar"
            (click)="closed.emit()"
          >
            <app-icon name="x" [size]="20" [stroke]="2" />
          </button>
        </div>
        <ng-content select="[drawer-tabs]" />
        <div class="flex min-h-0 grow flex-col gap-[22px] overflow-y-auto px-5 py-[22px] sm:px-7">
          <ng-content />
        </div>
        <ng-content select="[drawer-footer]" />
      </aside>
    </div>
  `,
})
export class DrawerComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly titleId = `app-drawer-title-${nextId++}`;

  readonly heading = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input<IconName>('edit');
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

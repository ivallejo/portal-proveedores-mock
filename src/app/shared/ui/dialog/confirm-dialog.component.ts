import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SpinnerComponent } from '../spinner/spinner.component';

/** Confirmación breve (activar / desactivar), con el botón principal en rojo si es destructiva. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': '!busy() && cancel.emit()' },
  template: `
    <div
      class="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-[rgba(14,42,92,0.45)] px-4"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        class="animate-pop flex w-full max-w-[480px] flex-col gap-3.5 rounded-[20px] bg-white p-7 shadow-dialog"
      >
        <span
          class="flex size-14 items-center justify-center rounded-full"
          [class]="danger() ? 'bg-[#FDE8E8] text-[#B42318]' : 'bg-[#E3F5EA] text-[#13653A]'"
        >
          <app-icon name="power" [size]="26" [stroke]="2" />
        </span>
        <h2 id="confirm-title" class="m-0 text-[21px] font-bold">{{ heading() }}</h2>
        <p class="m-0 text-[14.5px] leading-relaxed text-body">{{ text() }}</p>
        <div class="mt-1.5 flex justify-end gap-2.5">
          <button
            type="button"
            class="btn btn-secondary"
            [disabled]="busy()"
            (click)="cancel.emit()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn text-white"
            [class]="
              danger() ? 'bg-[#B42318] hover:bg-[#912018]' : 'bg-[#13653A] hover:bg-[#0F5230]'
            "
            [attr.aria-busy]="busy()"
            (click)="!busy() && confirm.emit()"
          >
            @if (busy()) {
              <app-spinner [size]="18" />
            }
            {{ confirmText() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly heading = input.required<string>();
  readonly text = input('');
  readonly confirmText = input('Confirmar');
  readonly danger = input(false);
  readonly busy = input(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}

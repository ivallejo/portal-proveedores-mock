import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

export type FileTag = 'XML' | 'PDF' | 'CDR' | 'EXTRA';
export type FileState = 'none' | 'uploading' | 'ok';

export interface ExtraFile {
  name: string;
  uploading: boolean;
}

const TAGS: Record<FileTag, { label: string; classes: string }> = {
  XML: { label: 'XML', classes: 'bg-[#E8F0FE] text-[#1E3FA8]' },
  PDF: { label: 'PDF', classes: 'bg-[#FDE8E8] text-[#A51E1E]' },
  CDR: { label: 'CDR', classes: 'bg-[#DFF4F4] text-[#0B5E61]' },
  EXTRA: { label: 'PDF', classes: 'bg-[#EDE7FB] text-[#5B3AA8]' },
};

/** Fila de carga de un archivo del comprobante (arrastrar o seleccionar). */
@Component({
  selector: 'app-file-drop',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-fade grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[14px] border-[1.5px] transition-[background,border-color,padding] duration-150"
      [class]="frameClass()"
      (dragenter)="onDragOver($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <span
        class="flex size-11 items-center justify-center rounded-[10px] text-[11.5px] font-bold tracking-[0.04em]"
        [class]="tagClass()"
        >{{ tagLabel() }}</span
      >
      <div class="flex min-w-0 flex-col gap-[3px]">
        <span class="flex flex-wrap items-center gap-2 text-sm font-bold">
          {{ title() }}
          <span
            class="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-bold"
            [class]="
              requirement() === 'Requerido'
                ? 'bg-warning-soft text-warning-text'
                : 'bg-[#F1F3F6] text-muted'
            "
            >{{ requirement() }}</span
          >
        </span>
        @if (notApplicable()) {
          <span class="text-[12.5px] text-muted">{{ notApplicable() }}</span>
        } @else if (dragging()) {
          <span class="flex items-center gap-1.5 text-[13px] font-bold text-primary">
            <app-icon name="upload" [size]="16" [stroke]="2" />Suelta el archivo para cargarlo
          </span>
        } @else {
          @if (error()) {
            <span role="alert" class="flex items-center gap-1.5 text-[12.5px] text-danger-text">
              <app-icon name="alert-circle" [size]="15" [stroke]="2" />{{ error() }}
            </span>
          }
          @if (state() === 'uploading') {
            <span class="flex flex-col gap-[5px]">
              <span class="truncate text-[12.5px] text-[#1E3FA8]">Subiendo {{ fileName() }}…</span>
              <span class="block h-1 overflow-hidden rounded-full bg-primary-track">
                <span class="animate-upload block h-1 rounded-full bg-primary"></span>
              </span>
            </span>
          } @else if (state() === 'ok') {
            <span class="flex min-w-0 items-center gap-1.5 text-[12.5px] text-success-text">
              <app-icon name="circle-check" [size]="15" [stroke]="2" />
              <span class="truncate">{{ fileName() }} · {{ fileSize() }}</span>
            </span>
          } @else if (extras().length) {
            <span class="mt-0.5 flex flex-col gap-[3px]">
              @for (extra of extras(); track extra.name + $index) {
                <span
                  class="flex min-w-0 items-center gap-2 text-[12.5px]"
                  [class]="extra.uploading ? 'text-[#1E3FA8]' : 'text-success-text'"
                >
                  <app-icon
                    [name]="extra.uploading ? 'upload' : 'circle-check'"
                    [size]="14"
                    [stroke]="2"
                  />
                  <span class="truncate">{{ extra.name }}</span>
                  <span class="shrink-0 text-subtle">{{
                    extra.uploading ? '· subiendo…' : '· listo'
                  }}</span>
                </span>
              }
            </span>
          } @else if (!error()) {
            <span class="flex flex-col gap-0.5">
              <span class="flex items-center gap-1.5 text-[12.5px] text-[#3B4A66]">
                <app-icon name="upload" [size]="15" [stroke]="2" />
                <span
                  >Arrastra el archivo aquí o
                  <strong class="text-primary">selecciónalo</strong></span
                >
              </span>
              <span class="text-xs text-subtle">{{ description() }} · {{ formatHint() }}</span>
            </span>
          }
        }
      </div>
      <div class="flex items-center gap-1.5">
        @if (state() === 'uploading') {
          <app-spinner [size]="20" tone="primary" />
        }
        @if (canPick()) {
          <label
            class="relative flex h-[38px] cursor-pointer items-center gap-[7px] rounded-[9px] border border-primary-line bg-white px-3.5 text-[13px] font-bold text-primary hover:bg-primary-tint focus-within:outline-3 focus-within:outline-primary/35"
          >
            <app-icon name="upload" [size]="16" [stroke]="2" />{{
              extras().length ? 'Agregar' : 'Seleccionar'
            }}
            <input
              type="file"
              class="absolute inset-0 size-full cursor-pointer opacity-0"
              [accept]="accept().join(',')"
              [multiple]="multiple()"
              [attr.aria-label]="'Seleccionar ' + title().toLowerCase()"
              (change)="onPick($event)"
            />
          </label>
        }
        @if (canRemove()) {
          <button
            type="button"
            class="flex size-[38px] items-center justify-center rounded-[9px] border border-line bg-white text-muted hover:text-danger-text"
            title="Quitar archivo"
            [attr.aria-label]="'Quitar ' + (fileName() || title().toLowerCase())"
            (click)="removed.emit()"
          >
            <app-icon name="trash" [size]="17" />
          </button>
        }
      </div>
    </div>
  `,
})
export class FileDropComponent {
  readonly tag = input<FileTag>('PDF');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly accept = input<string[]>(['.pdf']);
  readonly requirement = input<'Requerido' | 'Opcional' | 'No requerido'>('Requerido');
  readonly state = input<FileState>('none');
  readonly fileName = input('');
  readonly fileSize = input('');
  readonly error = input('');
  readonly highlightMissing = input(false);
  /** Texto cuando el archivo no aplica (por ejemplo, CDR con serie E). */
  readonly notApplicable = input('');
  readonly multiple = input(false);
  readonly extras = input<ExtraFile[]>([]);
  readonly files = output<File[]>();
  readonly removed = output<void>();

  readonly dragging = signal(false);
  readonly tagLabel = computed(() => TAGS[this.tag()].label);
  readonly tagClass = computed(() => TAGS[this.tag()].classes);
  readonly formatHint = computed(
    () => `${this.accept().join(' / ')} · máx. 5 MB${this.multiple() ? ' c/u' : ''}`,
  );
  readonly canPick = computed(
    () => !this.notApplicable() && (this.multiple() || this.state() === 'none'),
  );
  readonly canRemove = computed(
    () => !this.notApplicable() && (this.state() === 'ok' || this.extras().length > 0),
  );
  readonly frameClass = computed(() => {
    if (this.dragging()) return 'border-solid border-primary bg-[#EAF2FF] px-3.5 py-5';
    if (this.notApplicable()) return 'border-dashed border-primary-line bg-[#FAFBFC] px-3.5 py-3';
    if (this.state() === 'ok')
      return 'border-solid border-success-line bg-success-tint px-3.5 py-3';
    if (this.extras().length) return 'border-solid border-[#D9CCF5] bg-[#FAF8FF] px-3.5 py-3';
    if (this.error() || (this.highlightMissing() && this.requirement() === 'Requerido'))
      return 'border-dashed border-[#E8A0A0] bg-[#F9FBFE] px-3.5 py-3';
    return 'border-dashed border-primary-line bg-[#F9FBFE] px-3.5 py-3';
  });

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.canPick()) return;
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (event.relatedTarget && target.contains(event.relatedTarget as Node)) return;
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.canPick()) return;
    const list = Array.from(event.dataTransfer?.files ?? []);
    if (list.length) this.files.emit(this.multiple() ? list : list.slice(0, 1));
  }

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = Array.from(input.files ?? []);
    input.value = '';
    if (list.length) this.files.emit(list);
  }
}

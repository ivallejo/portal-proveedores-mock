import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { ExtraFile } from './extra-file';
import { FileState } from './file-state';
import { FileTag } from './file-tag';

const TAGS: Record<FileTag, { label: string; classes: string }> = {
  XML: { label: 'XML', classes: 'bg-primary-soft text-indigo-text' },
  PDF: { label: 'PDF', classes: 'bg-danger-soft-alt text-danger-text-alt' },
  CDR: { label: 'CDR', classes: 'bg-teal-soft text-teal-text' },
  EXTRA: { label: 'PDF', classes: 'bg-violet-soft text-violet-text' },
};

/** Fila de carga de un archivo del comprobante (arrastrar o seleccionar). */
@Component({
  selector: 'app-file-drop',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-drop.component.html',
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
    if (this.dragging()) return 'border-solid border-primary bg-primary-selected px-3.5 py-5';
    if (this.notApplicable())
      return 'border-dashed border-primary-line bg-surface-file px-3.5 py-3';
    if (this.state() === 'ok')
      return 'border-solid border-success-line bg-success-tint px-3.5 py-3';
    if (this.extras().length) return 'border-solid border-violet-line bg-violet-tint px-3.5 py-3';
    if (this.error() || (this.highlightMissing() && this.requirement() === 'Requerido'))
      return 'border-dashed border-danger-line-alt bg-surface-drop px-3.5 py-3';
    return 'border-dashed border-primary-line bg-surface-drop px-3.5 py-3';
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

import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { FileState } from './file-state';
import { FileTag } from './file-tag';

const TAGS: Record<FileTag, string> = {
  XML: 'bg-[#E8F0FE] text-[#1E3FA8]',
  PDF: 'bg-[#FDE8E8] text-[#A51E1E]',
  CDR: 'bg-[#DFF4F4] text-[#0B5E61]',
};

/** Fila de carga de un archivo del comprobante: se arrastra a la fila o se elige con «Seleccionar». */
@Component({
  selector: 'app-file-drop',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-drop.component.html',
})
export class FileDropComponent {
  readonly tag = input<FileTag>('PDF');
  readonly title = input.required<string>();
  readonly accept = input<string[]>(['.pdf']);
  readonly state = input<FileState>('none');
  readonly fileName = input('');
  readonly fileSize = input('');
  readonly error = input('');
  /** Marca la fila en rojo si falta el archivo (tras intentar registrar). */
  readonly highlightMissing = input(false);
  /** Texto cuando el archivo no aplica (por ejemplo, CDR con serie E). */
  readonly notApplicable = input('');
  readonly files = output<File[]>();
  readonly removed = output<void>();

  readonly dragging = signal(false);
  readonly tagClass = computed(() => TAGS[this.tag()]);
  readonly canPick = computed(() => !this.notApplicable() && this.state() === 'none');
  readonly frameClass = computed(() => {
    if (this.dragging()) return 'border-dashed border-primary bg-[#EAF2FF]';
    if (this.notApplicable()) return 'border-solid border-line bg-[#F7F8FA]';
    if (this.state() === 'ok') return 'border-solid border-[#BFE3CC] bg-[#F5FBF7]';
    if (this.error() || (this.highlightMissing() && this.state() === 'none'))
      return 'border-dashed border-[#E8A0A0] bg-white';
    return 'border-dashed border-[#C9D6EA] bg-white';
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
    if (list.length) this.files.emit(list.slice(0, 1));
  }

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = Array.from(input.files ?? []);
    input.value = '';
    if (list.length) this.files.emit(list);
  }
}

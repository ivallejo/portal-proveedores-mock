import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { ExtraFile } from '../file-drop/extra-file';

/** Zona de archivos extras: uno o varios PDF de sustento, cada uno con su chip para quitarlo. */
@Component({
  selector: 'app-extra-files-drop',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './extra-files-drop.component.html',
})
export class ExtraFilesDropComponent {
  /** «Se unirán en un solo PDF» (Sin OC) u «Opcional». */
  readonly note = input('Opcional');
  readonly accept = input<string[]>(['.pdf']);
  readonly extras = input<ExtraFile[]>([]);
  readonly error = input('');
  readonly files = output<File[]>();
  readonly removed = output<number>();

  readonly dragging = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
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
    const list = Array.from(event.dataTransfer?.files ?? []);
    if (list.length) this.files.emit(list);
  }

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = Array.from(input.files ?? []);
    input.value = '';
    if (list.length) this.files.emit(list);
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../ui/icon/icon.component';
import { HistoryEvent } from './document.model';

/** Línea de tiempo del historial del documento (panel derecho del detalle). */
@Component({
  selector: 'app-document-history',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-col gap-3.5' },
  templateUrl: './document-history.component.html',
})
export class DocumentHistoryComponent {
  readonly events = input<HistoryEvent[]>([]);
  readonly heading = input('Historial del documento');
}

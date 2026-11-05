import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { Area } from '../../../domain/models/area';

/** Tabla de áreas con esqueletos de carga y acciones de editar y activar/desactivar. */
@Component({
  selector: 'app-area-table',
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './area-table.component.html',
})
export class AreaTableComponent {
  readonly rows = input.required<Area[]>();
  readonly loading = input(false);
  /** Fila que se está editando o consultando (panel o diálogo abiertos). */
  readonly selectedId = input<string | null>(null);
  /** Fila que se acaba de guardar: se ilumina un momento. */
  readonly flashId = input<string | null>(null);
  readonly edit = output<Area>();
  readonly toggle = output<Area>();
}

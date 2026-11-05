import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { Society } from '../../../domain/models/society';

/** Tabla de sociedades con esqueletos de carga y acciones de editar y activar/desactivar. */
@Component({
  selector: 'app-society-table',
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './society-table.component.html',
})
export class SocietyTableComponent {
  readonly rows = input.required<Society[]>();
  readonly loading = input(false);
  /** Fila que se está editando o consultando (panel o diálogo abiertos). */
  readonly selectedId = input<string | null>(null);
  /** Fila que se acaba de guardar: se ilumina un momento. */
  readonly flashId = input<string | null>(null);
  readonly edit = output<Society>();
  readonly toggle = output<Society>();
}

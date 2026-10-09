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
  readonly edit = output<Area>();
  readonly toggle = output<Area>();
}

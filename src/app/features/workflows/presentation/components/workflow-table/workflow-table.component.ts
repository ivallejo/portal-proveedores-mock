import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { roleLabel } from '../../../../auth';
import { WorkflowEditorFacade } from '../../facades/workflow-editor.facade';
import { WorkflowListFacade } from '../../facades/workflow-list.facade';

/** Workflows configurados: búsqueda, tamaño de página, tabla y paginación. */
@Component({
  selector: 'app-workflow-table',
  imports: [FormsModule, BadgeComponent, EmptyStateComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './workflow-table.component.html',
})
export class WorkflowTableComponent {
  readonly list = inject(WorkflowListFacade);
  readonly editor = inject(WorkflowEditorFacade);
  readonly roleLabel = roleLabel;
}

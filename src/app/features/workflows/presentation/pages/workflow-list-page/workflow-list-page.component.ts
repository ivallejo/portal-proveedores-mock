import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { WorkflowFormDialogComponent } from '../../components/workflow-form-dialog/workflow-form-dialog.component';
import { WorkflowTableComponent } from '../../components/workflow-table/workflow-table.component';
import { WorkflowEditorFacade } from '../../facades/workflow-editor.facade';
import { WorkflowListFacade } from '../../facades/workflow-list.facade';

/** Configuración › Workflows de aprobación. */
@Component({
  selector: 'app-workflow-list-page',
  imports: [
    PageHeaderComponent,
    IconComponent,
    WorkflowTableComponent,
    WorkflowFormDialogComponent,
  ],
  providers: [WorkflowListFacade, WorkflowEditorFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflow-list-page.component.html',
})
export class WorkflowListPageComponent {
  readonly list = inject(WorkflowListFacade);
  readonly editor = inject(WorkflowEditorFacade);

  constructor() {
    this.list.load();
    this.editor.loadApprovers();
  }
}

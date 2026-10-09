import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { DialogComponent } from '../../../../../shared/ui/dialog/dialog.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { roleLabel } from '../../../../auth';
import { WorkflowEditorFacade } from '../../facades/workflow-editor.facade';

/** Alta o edición de un workflow: datos generales y niveles de aprobación con sus aprobadores. */
@Component({
  selector: 'app-workflow-form-dialog',
  imports: [FormsModule, CalloutComponent, DialogComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './workflow-form-dialog.component.html',
})
export class WorkflowFormDialogComponent {
  readonly editor = inject(WorkflowEditorFacade);
  readonly roleLabel = roleLabel;
}

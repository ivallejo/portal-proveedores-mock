import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkflowFacade } from '../state/workflow.facade';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import {
  CalloutComponent,
  EmptyStateComponent,
} from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page/page.components';

@Component({
  selector: 'app-workflows-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    BadgeComponent,
    DialogComponent,
    CalloutComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflows-page.component.html',
})
export class WorkflowsPageComponent {
  readonly controller = inject(WorkflowFacade);
}

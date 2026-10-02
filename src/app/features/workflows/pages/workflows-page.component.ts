import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkflowFacade } from '../state/workflow.facade';

@Component({
  selector: 'app-workflows-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflows-page.component.html',
  styleUrl: './workflows-page.component.scss',
})
export class WorkflowsPageComponent {
  readonly controller = inject(WorkflowFacade);
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalFacade } from '../../../core/state/portal.facade';

@Component({
  selector: 'app-workflows-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflows-page.component.html',
})
export class WorkflowsPageComponent {
  readonly controller = inject(PortalFacade);
}

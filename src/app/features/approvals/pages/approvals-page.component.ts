import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalFacade } from '../../../core/state/portal.facade';

@Component({
  selector: 'app-approvals-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals-page.component.html',
})
export class ApprovalsPageComponent {
  readonly controller = inject(PortalFacade);
}

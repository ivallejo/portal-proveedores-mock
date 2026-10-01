import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalFacade } from '../../../core/state/portal.facade';

@Component({
  selector: 'app-accounting-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounting-page.component.html',
})
export class AccountingPageComponent {
  readonly controller = inject(PortalFacade);
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalFacade } from '../../../../core/state/portal.facade';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents-list.component.html',
})
export class DocumentsListComponent {
  readonly controller = inject(PortalFacade);
}

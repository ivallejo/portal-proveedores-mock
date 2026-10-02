import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentsFacade } from '../../state/documents.facade';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents-list.component.html',
  styleUrl: './documents-list.component.scss',
})
export class DocumentsListComponent {
  readonly controller = inject(DocumentsFacade);
}

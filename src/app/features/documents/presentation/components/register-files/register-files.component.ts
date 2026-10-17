import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { ExtraFilesDropComponent } from '../extra-files-drop/extra-files-drop.component';
import { FileDropComponent } from '../file-drop/file-drop.component';
import { RegisterSectionTitleComponent } from '../register-section-title/register-section-title.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Columna «2 Archivos»: XML, PDF, CDR (si aplica) y extras; en documentos especiales, solo el PDF. */
@Component({
  selector: 'app-register-files',
  imports: [
    IconComponent,
    FileDropComponent,
    ExtraFilesDropComponent,
    RegisterSectionTitleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-files.component.html',
})
export class RegisterFilesComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { FileDropComponent } from '../file-drop/file-drop.component';
import { RegisterSectionTitleComponent } from '../register-section-title/register-section-title.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Paso 1: XML, PDF, CDR (si aplica) y anexos del comprobante. */
@Component({
  selector: 'app-register-files',
  imports: [CalloutComponent, FileDropComponent, RegisterSectionTitleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-files.component.html',
})
export class RegisterFilesComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

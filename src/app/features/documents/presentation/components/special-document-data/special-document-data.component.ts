import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { RegisterSectionTitleComponent } from '../register-section-title/register-section-title.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Documento especial: sociedad y tipo de documento. */
@Component({
  selector: 'app-special-document-data',
  imports: [CalloutComponent, IconComponent, RegisterSectionTitleComponent, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './special-document-data.component.html',
})
export class SpecialDocumentDataComponent {
  readonly facade = inject(RegisterDocumentFacade);
}

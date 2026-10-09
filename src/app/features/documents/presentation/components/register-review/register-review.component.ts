import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { currencyName, money } from '../../../../../shared/utils/money-format.util';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { ATTACHMENT_TONE } from '../../catalog/attachment-tones';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Paso 2: revisión del comprobante leído del XML, archivos y datos del registro. */
@Component({
  selector: 'app-register-review',
  imports: [BadgeComponent, CalloutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-review.component.html',
})
export class RegisterReviewComponent {
  readonly facade = inject(RegisterDocumentFacade);
  readonly money = money;
  readonly formatDate = formatDate;
  readonly currencyName = currencyName;
  readonly attachmentTone = ATTACHMENT_TONE;
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { money } from '../../../../../shared/utils/money-format.util';
import { ElectronicDocument } from '../../../domain/models/electronic-document';

/** Detalle del documento electrónico leído del XML, antes de validarlo en SAP y SUNAT (flujos 01 y 02). */
@Component({
  selector: 'app-electronic-document-summary',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './electronic-document-summary.component.html',
})
export class ElectronicDocumentSummaryComponent {
  readonly document = input.required<ElectronicDocument>();
  readonly money = money;
  readonly formatDate = formatDate;
}

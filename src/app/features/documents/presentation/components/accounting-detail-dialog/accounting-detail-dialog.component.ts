import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogComponent } from '../../../../../shared/ui/dialog/dialog.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { LoadingStateComponent } from '../../../../../shared/ui/loading-state/loading-state.component';
import { ResultStateComponent } from '../../../../../shared/ui/result-state/result-state.component';
import { DocumentHistoryComponent } from '../document-history/document-history.component';
import { AccountingActionPanelsComponent } from '../accounting-action-panels/accounting-action-panels.component';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { STATUS_TONE } from '../../catalog/document-status-tones';
import { ENTRY_TONE } from '../../catalog/entry-type-tones';
import { ENTRY_LABEL } from '../../catalog/entry-type-labels';
import { ATTACHMENT_TONE } from '../../catalog/attachment-tones';
import { AccountingInboxFacade } from '../../facades/accounting-inbox.facade';
import { currencyName, money } from '../../../../../shared/utils/money-format.util';

/** Detalle del documento por contabilizar: datos, orden, ítems, archivos, historial y acciones. */
@Component({
  selector: 'app-accounting-detail-dialog',
  imports: [
    DialogComponent,
    BadgeComponent,
    CalloutComponent,
    IconComponent,
    LoadingStateComponent,
    ResultStateComponent,
    DocumentHistoryComponent,
    AccountingActionPanelsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './accounting-detail-dialog.component.html',
})
export class AccountingDetailDialogComponent {
  readonly facade = inject(AccountingInboxFacade);
  readonly money = money;
  readonly currencyName = currencyName;
  readonly formatDate = formatDate;
  readonly statusTone = STATUS_TONE;
  readonly entryTone = ENTRY_TONE;
  readonly entryLabel = ENTRY_LABEL;
  readonly attachmentTone = ATTACHMENT_TONE;
}

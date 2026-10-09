import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogComponent } from '../../../../../shared/ui/dialog/dialog.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { LoadingStateComponent } from '../../../../../shared/ui/loading-state/loading-state.component';
import { ResultStateComponent } from '../../../../../shared/ui/result-state/result-state.component';
import { DocumentHistoryComponent } from '../document-history/document-history.component';
import { ApprovalActionPanelsComponent } from '../approval-action-panels/approval-action-panels.component';
import { formatDate } from '../../../../../shared/utils/date-format.util';
import { STATUS_TONE } from '../../catalog/document-status-tones';
import { ENTRY_TONE } from '../../catalog/entry-type-tones';
import { ApprovalInboxFacade } from '../../facades/approval-inbox.facade';
import { currencyName, money } from '../../../../../shared/utils/money-format.util';

/** Detalle del documento por aprobar: datos, importes, archivos, historial y acciones. */
@Component({
  selector: 'app-approval-detail-dialog',
  imports: [
    DialogComponent,
    BadgeComponent,
    CalloutComponent,
    IconComponent,
    LoadingStateComponent,
    ResultStateComponent,
    DocumentHistoryComponent,
    ApprovalActionPanelsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './approval-detail-dialog.component.html',
})
export class ApprovalDetailDialogComponent {
  readonly facade = inject(ApprovalInboxFacade);
  readonly money = money;
  readonly currencyName = currencyName;
  readonly formatDate = formatDate;
  readonly statusTone = STATUS_TONE;
  readonly entryTone = ENTRY_TONE;
}

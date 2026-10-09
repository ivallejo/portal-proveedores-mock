import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { money } from '../../../../../shared/utils/money-format.util';
import { currencyTone } from '../../../../../shared/ui/tone/currency-tone';
import { STATUS_TONE } from '../../catalog/document-status-tones';
import { ENTRY_TONE } from '../../catalog/entry-type-tones';
import { IconName } from '../../../../../shared/ui/icon/icon-name';
import { DocumentInboxFacade } from '../../facades/document-inbox.facade';

/** Listado paginado de una bandeja de documentos. */
@Component({
  selector: 'app-document-inbox-table',
  imports: [BadgeComponent, EmptyStateComponent, IconComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './document-inbox-table.component.html',
})
export class DocumentInboxTableComponent {
  readonly label = input.required<string>();
  readonly minWidth = input.required<number>();
  readonly emptyIcon = input.required<IconName>();
  readonly facade = inject(DocumentInboxFacade);
  readonly money = money;
  readonly currencyTone = currencyTone;
  readonly statusTone = STATUS_TONE;
  readonly entryTone = ENTRY_TONE;
}

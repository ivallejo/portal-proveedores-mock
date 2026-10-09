import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { onlyDigits } from '../../../../../shared/utils/text-format.util';
import { DocumentInboxFacade } from '../../facades/document-inbox.facade';

/** Filtros de una bandeja: RUC del proveedor y estado. */
@Component({
  selector: 'app-document-inbox-filters',
  imports: [IconComponent, SelectComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './document-inbox-filters.component.html',
})
export class DocumentInboxFiltersComponent {
  /** Prefijo del id del campo RUC (único en la página). */
  readonly idPrefix = input.required<string>();
  readonly facade = inject(DocumentInboxFacade);

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value);
    this.facade.setFilter('ruc', input.value);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { RegisterSectionTitleComponent } from '../register-section-title/register-section-title.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { onlyDigits } from '../../../../../shared/utils/text-format.util';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Documento especial: tipo, sociedad, RUC del emisor, fecha, número e importe. */
@Component({
  selector: 'app-special-document-data',
  imports: [IconComponent, RegisterSectionTitleComponent, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './special-document-data.component.html',
})
export class SpecialDocumentDataComponent {
  readonly facade = inject(RegisterDocumentFacade);

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value).slice(0, 11);
    this.facade.setSpecial('ruc', input.value);
  }

  onNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 20);
    this.facade.setSpecial('number', input.value);
  }

  onAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\d.,]/g, '').slice(0, 14);
    this.facade.setSpecial('amount', input.value);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { RegisterSectionTitleComponent } from '../register-section-title/register-section-title.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { money } from '../../../../../shared/utils/money-format.util';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Paso 1: sociedad y orden validada en SAP (Con OC), o área y aprobador (Sin OC). */
@Component({
  selector: 'app-register-order-data',
  imports: [
    CalloutComponent,
    IconComponent,
    RegisterSectionTitleComponent,
    SelectComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-order-data.component.html',
})
export class RegisterOrderDataComponent {
  readonly facade = inject(RegisterDocumentFacade);
  readonly money = money;

  onOrderNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 16);
    this.facade.setOrderNumber(input.value);
  }
}

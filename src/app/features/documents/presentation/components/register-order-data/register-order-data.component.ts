import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { RegisterSectionTitleComponent } from '../register-section-title/register-section-title.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { DeliveryType } from '../../../domain/models/delivery-type';
import { OrderType } from '../../../domain/models/order-type';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Columna «1 Datos del documento»: sociedad, tipo de orden y entrega, y número (Con OC), o área y aprobador (Sin OC). */
@Component({
  selector: 'app-register-order-data',
  imports: [IconComponent, RegisterSectionTitleComponent, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './register-order-data.component.html',
})
export class RegisterOrderDataComponent {
  readonly facade = inject(RegisterDocumentFacade);
  readonly orderTypes: OrderType[] = ['Bien', 'Servicio'];
  readonly deliveryTypes: DeliveryType[] = ['Entregado a bordo', 'Entregado en almacén'];

  onOrderNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 16);
    this.facade.setOrderNumber(input.value);
  }
}

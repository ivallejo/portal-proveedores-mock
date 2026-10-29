import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

const BENEFITS = [
  'Órdenes de pago y comprobantes en línea',
  'Estado de tus facturas, del registro al pago',
  'Acceso seguro con tu RUC o usuario',
];

/** Empresas del grupo, con el alto de su logo en la cápsula del panel. */
const GROUP_LOGOS: { src: string; alt: string; height: string }[] = [
  { src: 'images/grupo/naviera-petral.png', alt: 'Naviera Petral', height: 'h-5' },
  { src: 'images/grupo/navitranso.png', alt: 'Navitranso', height: 'h-[42px]' },
  { src: 'images/grupo/ultratug.png', alt: 'Ultratug Perú', height: 'h-7' },
];

/** Marco de las pantallas de acceso: panel del grupo a la izquierda y formulario a la derecha. */
@Component({
  selector: 'app-auth-layout',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  /** Texto bajo el título del panel, propio de cada pantalla. */
  readonly description = input('');
  readonly benefits = BENEFITS;
  readonly groupLogos = GROUP_LOGOS;
}

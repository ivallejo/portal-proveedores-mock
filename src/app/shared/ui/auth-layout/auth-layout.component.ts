import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';

const HIGHLIGHTS: { icon: IconName; label: string }[] = [
  { icon: 'shield-check', label: 'Seguro' },
  { icon: 'bolt', label: 'Rápido' },
  { icon: 'circle-check', label: 'Confiable' },
  { icon: 'clock', label: 'Siempre disponible' },
];

/** Marco de las pantallas de acceso: panel institucional a la izquierda y formulario a la derecha. */
@Component({
  selector: 'app-auth-layout',
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  readonly heading = input.required<string>();
  readonly accent = input.required<string>();
  readonly description = input('');
  readonly highlights = HIGHLIGHTS;
}

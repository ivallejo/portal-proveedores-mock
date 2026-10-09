import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';

/** Ícono en recuadro + título + descripción de cada paso. */
@Component({
  selector: 'app-auth-heading',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-3.5' },
  templateUrl: './auth-heading.component.html',
})
export class AuthHeadingComponent {
  readonly icon = input.required<IconName>();
  readonly heading = input.required<string>();
  readonly success = input(false);
}

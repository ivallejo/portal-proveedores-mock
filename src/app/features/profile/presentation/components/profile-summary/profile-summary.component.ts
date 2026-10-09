import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { ProfileFacade } from '../../facades/profile.facade';

/** Encabezado de Mi perfil: avatar, nombre, rol, estado, usuario de acceso y fechas. */
@Component({
  selector: 'app-profile-summary',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './profile-summary.component.html',
})
export class ProfileSummaryComponent {
  readonly facade = inject(ProfileFacade);
  readonly stamp = formatDateTime;
}

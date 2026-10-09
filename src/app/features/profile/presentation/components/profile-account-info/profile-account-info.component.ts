import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { ProfileFacade } from '../../facades/profile.facade';

/** Información de la cuenta (solo lectura): usuario, rol, área o tipo de contribuyente, estado y sociedades. */
@Component({
  selector: 'app-profile-account-info',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './profile-account-info.component.html',
})
export class ProfileAccountInfoComponent {
  readonly facade = inject(ProfileFacade);
  readonly stamp = formatDateTime;
}

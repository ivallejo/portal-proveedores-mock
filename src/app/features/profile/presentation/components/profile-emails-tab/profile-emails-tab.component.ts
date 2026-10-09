import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { Profile } from '../../../domain/models/profile';
import { PROFILE_EMAIL_TYPES } from '../../catalog/profile-email-types';
import { ProfileFacade } from '../../facades/profile.facade';

/** Pestaña Mis correos: verificar, hacer principal, eliminar y agregar correos. */
@Component({
  selector: 'app-profile-emails-tab',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './profile-emails-tab.component.html',
})
export class ProfileEmailsTabComponent {
  readonly facade = inject(ProfileFacade);
  readonly me = input.required<Profile>();
  readonly emailTypes = PROFILE_EMAIL_TYPES;
  readonly stamp = formatDateTime;
}

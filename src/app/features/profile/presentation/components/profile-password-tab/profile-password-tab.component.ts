import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { PasswordFieldComponent } from '../../../../../shared/ui/password-field/password-field.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import { Profile } from '../../../domain/models/profile';
import { ProfileFacade } from '../../facades/profile.facade';

/** Pestaña Contraseña: cambio con la contraseña actual (salvo si es temporal), requisitos y seguridad. */
@Component({
  selector: 'app-profile-password-tab',
  imports: [CalloutComponent, IconComponent, PasswordFieldComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './profile-password-tab.component.html',
})
export class ProfilePasswordTabComponent {
  readonly facade = inject(ProfileFacade);
  readonly me = input.required<Profile>();
  readonly stamp = formatDateTime;
}

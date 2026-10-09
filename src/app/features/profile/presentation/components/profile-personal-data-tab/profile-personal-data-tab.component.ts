import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { Profile } from '../../../domain/models/profile';
import { ProfileFacade } from '../../facades/profile.facade';

/** Pestaña Datos personales: la razón social (proveedor) o los nombres y apellidos (personal interno). */
@Component({
  selector: 'app-profile-personal-data-tab',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './profile-personal-data-tab.component.html',
})
export class ProfilePersonalDataTabComponent {
  readonly facade = inject(ProfileFacade);
  readonly me = input.required<Profile>();
}

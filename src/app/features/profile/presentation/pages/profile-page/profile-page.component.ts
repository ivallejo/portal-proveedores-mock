import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { PROFILE_TABS } from '../../catalog/profile-tabs';
import { ProfileAccountInfoComponent } from '../../components/profile-account-info/profile-account-info.component';
import { ProfileEmailsTabComponent } from '../../components/profile-emails-tab/profile-emails-tab.component';
import { ProfilePasswordTabComponent } from '../../components/profile-password-tab/profile-password-tab.component';
import { ProfilePersonalDataTabComponent } from '../../components/profile-personal-data-tab/profile-personal-data-tab.component';
import { ProfileSummaryComponent } from '../../components/profile-summary/profile-summary.component';
import { ProfileFacade } from '../../facades/profile.facade';

/** Mi perfil: resumen, datos de la cuenta y pestañas Datos personales, Mis correos y Contraseña. */
@Component({
  selector: 'app-profile-page',
  imports: [
    PageHeaderComponent,
    CalloutComponent,
    ProfileSummaryComponent,
    ProfileAccountInfoComponent,
    ProfilePersonalDataTabComponent,
    ProfileEmailsTabComponent,
    ProfilePasswordTabComponent,
  ],
  providers: [ProfileFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  readonly facade = inject(ProfileFacade);
  readonly tabs = PROFILE_TABS;

  constructor() {
    inject(PageLoadingService).bind(this.facade.busy, 'Cargando tu perfil');
    this.facade.load();
  }
}

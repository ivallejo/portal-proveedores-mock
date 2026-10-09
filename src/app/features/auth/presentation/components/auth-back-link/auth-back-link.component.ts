import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

/** Enlace «Volver al inicio de sesión». */
@Component({
  selector: 'app-auth-back-link',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-back-link.component.html',
})
export class AuthBackLinkComponent {}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionFacade } from '../../facades/session.facade';
import { userFacingMessage } from '../../../../../shared/errors/user-facing-message';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AuthLayoutComponent } from '../../../../../shared/ui/auth-layout/auth-layout.component';
import { PasswordFieldComponent } from '../../../../../shared/ui/password-field/password-field.component';

@Component({
  selector: 'app-login-page',
  imports: [
    AuthLayoutComponent,
    PasswordFieldComponent,
    IconComponent,
    SpinnerComponent,
    CalloutComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly session = inject(SessionFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly identifier = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal('');

  submit(event: Event): void {
    event.preventDefault();
    if (this.loading()) return;
    const identifier = this.identifier().trim();
    if (!identifier || !this.password()) {
      this.error.set('Ingresa tu RUC o usuario y tu contraseña.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.session.login(identifier, this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // Con contraseña temporal el único destino posible es el cambio de contraseña.
        void this.router.navigateByUrl(
          returnUrl?.startsWith('/') && !this.session.user()?.mustChangePassword
            ? returnUrl
            : this.session.landingPath(),
        );
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(userFacingMessage(err, 'Usuario o contraseña incorrectos.'));
      },
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionFacade } from '../../facades/session.facade';
import { userFacingMessage } from '../../../../../shared/errors/user-facing-message';
import { passwordRules } from '../../../domain/rules/password-rules';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AuthLayoutComponent } from '../../../../../shared/ui/auth-layout/auth-layout.component';
import { AuthHeadingComponent } from '../../../../../shared/ui/auth-heading/auth-heading.component';
import { PasswordFieldComponent } from '../../../../../shared/ui/password-field/password-field.component';

/** Cambio obligatorio de la contraseña: temporal (entregada por el administrador) o vencida (90 días). */
@Component({
  selector: 'app-temporary-password-page',
  imports: [
    AuthLayoutComponent,
    AuthHeadingComponent,
    PasswordFieldComponent,
    CalloutComponent,
    IconComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './temporary-password-page.component.html',
})
export class TemporaryPasswordPageComponent {
  readonly session = inject(SessionFacade);
  private readonly router = inject(Router);

  readonly password = signal('');
  readonly confirmation = signal('');
  readonly error = signal<'' | 'rules' | 'mismatch' | 'server'>('');
  readonly serverError = signal('');
  readonly busy = signal(false);

  readonly rules = computed(() => {
    const user = this.session.user();
    return passwordRules(this.password(), [user?.username, user?.name, user?.providerId]);
  });
  /** Venció (90 días) en vez de ser temporal: cambia el texto de la pantalla. */
  readonly expired = computed(() => !!this.session.user()?.passwordExpired);

  submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    if (!this.rules().every((rule) => rule.ok)) {
      return this.error.set('rules');
    }
    if (this.password() !== this.confirmation()) return this.error.set('mismatch');
    this.error.set('');
    this.busy.set(true);
    // La sesión se abrió con la contraseña temporal: el backend no la vuelve a pedir.
    this.session.changePassword(this.password()).subscribe({
      next: () => {
        this.busy.set(false);
        void this.router.navigateByUrl(this.session.landingPath());
      },
      error: (error) => {
        this.busy.set(false);
        this.serverError.set(userFacingMessage(error, 'Inténtalo nuevamente en unos minutos.'));
        this.error.set('server');
      },
    });
  }

  logout(): void {
    this.session.logout();
    void this.router.navigate(['/login']);
  }
}

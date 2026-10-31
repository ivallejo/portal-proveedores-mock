import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionFacade } from '../../facades/session.facade';
import { userFacingMessage } from '../../../../../shared/errors/user-facing-message';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AuthLayoutComponent } from '../../../../../shared/ui/auth-layout/auth-layout.component';
import { AuthBackLinkComponent } from '../../components/auth-back-link/auth-back-link.component';
import { AuthHeadingComponent } from '../../../../../shared/ui/auth-heading/auth-heading.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    AuthLayoutComponent,
    AuthBackLinkComponent,
    AuthHeadingComponent,
    CalloutComponent,
    IconComponent,
    SpinnerComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password-page.component.html',
})
export class ForgotPasswordPageComponent {
  private readonly session = inject(SessionFacade);

  /** RUC del proveedor o usuario del personal interno (como en el login). */
  readonly identifier = signal('');
  readonly identifierError = signal('');
  readonly error = signal('');
  readonly busy = signal(false);
  readonly sent = signal(false);
  readonly maskedEmail = signal('');

  onIdentifier(event: Event): void {
    this.identifier.set((event.target as HTMLInputElement).value);
    this.identifierError.set('');
    this.error.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    const identifier = this.identifier().trim();
    if (!identifier) {
      this.identifierError.set('Ingresa tu RUC o usuario.');
      return;
    }
    this.busy.set(true);
    this.session.requestPasswordReset(identifier).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.maskedEmail.set(response.maskedEmail);
        this.sent.set(true);
      },
      error: (err) => {
        this.busy.set(false);
        // Una cuenta inexistente no llega aquí: el adaptador lo trata como envío genérico.
        this.error.set(userFacingMessage(err, 'Inténtalo nuevamente en unos minutos.'));
      },
    });
  }
}

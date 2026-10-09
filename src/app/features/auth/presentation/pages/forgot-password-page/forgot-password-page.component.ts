import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionFacade } from '../../facades/session.facade';
import { userFacingMessage } from '../../../../../shared/errors/user-facing-message';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { onlyDigits } from '../../../../../shared/utils/text-format.util';
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

  readonly ruc = signal('');
  readonly rucError = signal('');
  readonly error = signal('');
  readonly busy = signal(false);
  readonly sent = signal(false);
  readonly maskedEmail = signal('');

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = onlyDigits(input.value);
    input.value = value;
    this.ruc.set(value);
    this.rucError.set('');
    this.error.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    if (this.ruc().length !== 11) {
      this.rucError.set('Ingresa un RUC de 11 dígitos.');
      return;
    }
    this.busy.set(true);
    this.session.requestPasswordReset(this.ruc()).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.maskedEmail.set(response.maskedEmail);
        this.sent.set(true);
      },
      error: (err) => {
        this.busy.set(false);
        // Un RUC inexistente no llega aquí: el adaptador lo trata como envío genérico.
        this.error.set(userFacingMessage(err, 'Inténtalo nuevamente en unos minutos.'));
      },
    });
  }
}

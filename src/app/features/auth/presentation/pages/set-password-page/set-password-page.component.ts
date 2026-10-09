import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessionFacade } from '../../facades/session.facade';
import { userFacingMessage } from '../../../../../shared/errors/user-facing-message';
import { passwordRules } from '../../../domain/rules/password-rules';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthBackLinkComponent } from '../../components/auth-back-link/auth-back-link.component';
import { AuthHeadingComponent } from '../../components/auth-heading/auth-heading.component';
import { PasswordFieldComponent } from '../../components/password-field/password-field.component';
import { SetPasswordMode } from './set-password-mode';

const COPY: Record<
  SetPasswordMode,
  {
    heading: string;
    accent: string;
    description: string;
    title: string;
    button: string;
    doneTitle: string;
    doneText: string;
  }
> = {
  activation: {
    heading: 'Protege tu',
    accent: 'acceso al portal',
    description:
      'Crea una contraseña segura para ingresar al portal y consultar la información de tu empresa.',
    title: 'Crea tu contraseña',
    button: 'Registrar',
    doneTitle: '¡Contraseña registrada!',
    doneText:
      'Tu cuenta quedó activa. Ya puedes ingresar al portal con tu usuario y tu contraseña.',
  },
  reset: {
    heading: 'Actualiza tu',
    accent: 'contraseña',
    description: 'Elige una nueva contraseña segura para seguir ingresando al portal.',
    title: 'Cambia tu contraseña',
    button: 'Cambiar',
    doneTitle: '¡Contraseña actualizada!',
    doneText:
      'Tu contraseña se cambió correctamente. Ya puedes ingresar al portal con tu nueva contraseña.',
  },
};

/** Crear contraseña (enlace de activación) o cambiarla (enlace de recuperación). */
@Component({
  selector: 'app-set-password-page',
  imports: [
    AuthLayoutComponent,
    AuthBackLinkComponent,
    AuthHeadingComponent,
    PasswordFieldComponent,
    CalloutComponent,
    IconComponent,
    SpinnerComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './set-password-page.component.html',
})
export class SetPasswordPageComponent {
  private readonly session = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);

  private readonly mode: SetPasswordMode =
    this.route.snapshot.data['mode'] === 'reset' ? 'reset' : 'activation';
  /** Proveedor: RUC. Personal interno: su usuario (DNI). */
  readonly ruc = this.route.snapshot.queryParamMap.get('ruc') ?? '';
  readonly user = this.route.snapshot.queryParamMap.get('user') ?? '';
  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly linkValid = (/^\d{11}$/.test(this.ruc) || this.user.length > 0) && this.token.length > 0;
  readonly copy = signal(COPY[this.mode]);

  readonly password = signal('');
  readonly confirmation = signal('');
  readonly error = signal<'' | 'req' | 'mismatch' | 'server'>('');
  readonly serverError = signal('');
  readonly busy = signal(false);
  readonly done = signal(false);

  readonly rules = computed(() => passwordRules(this.password()));

  submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    if (!this.rules().every((rule) => rule.ok)) return this.error.set('req');
    if (this.password() !== this.confirmation()) return this.error.set('mismatch');
    this.error.set('');
    this.busy.set(true);
    this.session
      .confirmPasswordReset(
        { ruc: this.ruc || undefined, user: this.user || undefined },
        this.token,
        this.password(),
        this.mode === 'activation' ? 'activation' : 'password-reset',
      )
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.done.set(true);
        },
        error: (err) => {
          this.busy.set(false);
          this.serverError.set(
            userFacingMessage(err, 'El enlace es inválido o ya venció. Solicita uno nuevo.'),
          );
          this.error.set('server');
        },
      });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CalloutComponent } from '../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AuthLayoutComponent } from '../components/auth-layout.component';
import {
  AuthBackLinkComponent,
  AuthHeadingComponent,
  PasswordFieldComponent,
} from '../components/auth-ui.components';

type Mode = 'activation' | 'reset';

const COPY: Record<
  Mode,
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
  template: `
    <app-auth-layout
      [heading]="copy().heading"
      [accent]="copy().accent"
      [description]="copy().description"
    >
      <app-auth-back-link />
      @if (!linkValid) {
        <app-callout tone="danger" heading="Enlace no válido">
          El enlace está incompleto o ya no es válido. Solicita uno nuevo desde «¿Olvidaste tu
          contraseña?».
        </app-callout>
        <a routerLink="/recuperar-contrasena" class="btn btn-primary h-[52px] text-base"
          >Solicitar un nuevo enlace</a
        >
      } @else if (!done()) {
        <form class="animate-fade flex flex-col gap-5" (submit)="submit($event)" novalidate>
          <app-auth-heading icon="lock" [heading]="copy().title">
            Define la contraseña con la que ingresarás al portal con
            {{ ruc ? 'el RUC' : 'el usuario' }}
            <strong class="text-ink tabular-nums">{{ ruc || user }}</strong
            >.
          </app-auth-heading>

          <app-password-field
            inputId="pw1"
            label="Contraseña"
            placeholder="Contraseña"
            autocomplete="new-password"
            [invalid]="error() === 'req'"
            [(value)]="password"
          />
          <app-password-field
            inputId="pw2"
            label="Confirmar contraseña"
            placeholder="Confirmar contraseña"
            autocomplete="new-password"
            [invalid]="error() === 'mismatch'"
            [(value)]="confirmation"
          />

          <div
            aria-live="polite"
            class="grid grid-cols-1 gap-x-3.5 gap-y-2 rounded-xl bg-primary-tint px-4 py-3.5 sm:grid-cols-2"
          >
            @for (rule of rules(); track rule.label) {
              <div
                class="flex items-center gap-2 text-[13px] font-medium"
                [class]="
                  rule.ok
                    ? 'text-[#15803D]'
                    : error() === 'req'
                      ? 'text-danger-text'
                      : 'text-muted-auth'
                "
              >
                <app-icon
                  [name]="rule.ok ? 'check' : 'circle'"
                  [size]="16"
                  [stroke]="rule.ok ? 2.6 : 1.8"
                />
                {{ rule.label }}
              </div>
            }
          </div>

          @switch (error()) {
            @case ('mismatch') {
              <app-callout tone="danger" heading="Las contraseñas no coinciden">
                Verifica que la contraseña y su confirmación sean iguales e inténtalo nuevamente.
              </app-callout>
            }
            @case ('req') {
              <app-callout tone="danger" heading="La contraseña no cumple los requisitos">
                Debe tener mínimo 8 caracteres, una letra mayúscula, una minúscula y un número.
              </app-callout>
            }
            @case ('server') {
              <app-callout tone="danger" heading="No pudimos guardar la contraseña">{{
                serverError()
              }}</app-callout>
            }
          }

          <button type="submit" class="btn btn-primary h-[52px] text-base" [disabled]="busy()">
            @if (busy()) {
              <app-spinner [size]="20" />Guardando…
            } @else {
              <app-icon name="lock" [size]="20" />{{ copy().button }}
            }
          </button>
        </form>
      } @else {
        <div class="animate-fade flex flex-col gap-[22px]">
          <div class="flex flex-col items-center gap-[18px] pt-1.5 pb-1 text-center">
            <span class="flex size-[84px] items-center justify-center rounded-full bg-success-soft">
              <span
                class="animate-pop flex size-[58px] items-center justify-center rounded-full bg-success-bright text-white"
              >
                <app-icon name="check" [size]="30" [stroke]="2.6" />
              </span>
            </span>
            <div class="flex flex-col gap-2">
              <h2 class="m-0 text-[30px] font-bold tracking-tight text-ink">
                {{ copy().doneTitle }}
              </h2>
              <p class="m-0 text-[15px] leading-relaxed text-body-auth">{{ copy().doneText }}</p>
            </div>
          </div>
          <a routerLink="/login" class="btn btn-primary h-[52px] text-base">
            <app-icon name="arrow-right" [size]="20" [stroke]="2.2" />Iniciar sesión
          </a>
        </div>
      }
    </app-auth-layout>
  `,
})
export class SetPasswordPageComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly mode: Mode =
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

  readonly rules = computed(() => {
    const value = this.password();
    return [
      { label: 'Mínimo 8 caracteres', ok: value.length >= 8 },
      { label: 'Una letra mayúscula', ok: /[A-ZÁÉÍÓÚÑ]/.test(value) },
      { label: 'Una letra minúscula', ok: /[a-záéíóúñ]/.test(value) },
      { label: 'Un número', ok: /\d/.test(value) },
    ];
  });

  submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    if (!this.rules().every((rule) => rule.ok)) return this.error.set('req');
    if (this.password() !== this.confirmation()) return this.error.set('mismatch');
    this.error.set('');
    this.busy.set(true);
    this.auth
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
            err.error?.message || 'El enlace es inválido o ya venció. Solicita uno nuevo.',
          );
          this.error.set('server');
        },
      });
  }
}

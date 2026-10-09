import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CalloutComponent } from '../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { onlyDigits } from '../../../shared/utils/text-format.util';
import { AuthLayoutComponent } from '../components/auth-layout.component';
import { AuthBackLinkComponent, AuthHeadingComponent } from '../components/auth-ui.components';

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
  template: `
    <app-auth-layout
      heading="Recupera el acceso"
      accent="a tu cuenta"
      description="Te ayudamos a cambiar tu contraseña en pocos pasos para que sigas gestionando tus documentos."
    >
      <app-auth-back-link />
      @if (!sent()) {
        <form class="animate-fade flex flex-col gap-5" (submit)="submit($event)" novalidate>
          <app-auth-heading icon="key" heading="¿Olvidaste tu contraseña?">
            Ingresa el RUC de tu empresa y te enviaremos un correo con las instrucciones para
            cambiarla.
          </app-auth-heading>
          <div class="flex flex-col gap-2">
            <label for="ol-ruc" class="text-sm font-bold text-ink">RUC</label>
            <div class="relative flex">
              <app-icon
                name="building"
                [size]="20"
                class="pointer-events-none absolute top-[15px] left-4 text-body-auth"
              />
              <input
                id="ol-ruc"
                type="text"
                inputmode="numeric"
                maxlength="11"
                placeholder="Ingresa los 11 dígitos de tu RUC"
                [value]="ruc()"
                (input)="onRuc($event)"
                [attr.aria-invalid]="!!rucError()"
                aria-describedby="ol-ruc-help"
                class="h-[50px] grow rounded-[10px] border bg-white pr-4 pl-12 text-[15px] tracking-[0.04em] text-ink tabular-nums outline-none focus:border-primary"
                [class.border-field-auth]="!rucError()"
                [class.border-[#E04848]]="!!rucError()"
              />
            </div>
            <span
              id="ol-ruc-help"
              class="text-[13px]"
              [class]="rucError() ? 'text-danger-text' : 'text-muted-auth'"
              >{{ rucError() || 'Debe tener 11 dígitos.' }}</span
            >
          </div>
          @if (error()) {
            <app-callout tone="danger" heading="No pudimos enviar el correo">{{
              error()
            }}</app-callout>
          }
          <button type="submit" class="btn btn-primary h-[52px] text-base" [disabled]="busy()">
            @if (busy()) {
              <app-spinner [size]="20" />Enviando…
            } @else {
              <app-icon name="mail" [size]="20" />Enviar
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
                <app-icon name="mail" [size]="28" [stroke]="2" />
              </span>
            </span>
            <div class="flex flex-col gap-2">
              <h2 class="m-0 text-[30px] font-bold tracking-tight text-ink">Revisa tu correo</h2>
              <p class="m-0 text-[15px] leading-relaxed text-body-auth">
                @if (maskedEmail()) {
                  Enviamos las instrucciones para cambiar tu contraseña a
                  <strong class="text-ink">{{ maskedEmail() }}</strong
                  >.
                } @else {
                  Si el RUC está registrado, recibirás un correo con las instrucciones para cambiar
                  tu contraseña.
                }
              </p>
            </div>
            <app-callout tone="info" icon="clock" class="w-full text-left text-[13px]">
              El enlace vence en 24 horas. Si no ves el correo, revisa tu carpeta de spam o correo
              no deseado.
            </app-callout>
          </div>
          <a routerLink="/login" class="btn btn-primary h-[52px] text-base"
            >Volver al inicio de sesión</a
          >
        </div>
      }
    </app-auth-layout>
  `,
})
export class ForgotPasswordPageComponent {
  private readonly auth = inject(AuthService);

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
    this.auth.requestPasswordReset(this.ruc()).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.maskedEmail.set(response?.maskedEmail ?? '');
        this.sent.set(true);
      },
      error: (err) => {
        this.busy.set(false);
        // No se revela si el RUC existe: un 404 se muestra como envío genérico.
        if (err.status === 404) {
          this.maskedEmail.set('');
          this.sent.set(true);
          return;
        }
        this.error.set(
          err.status === 0
            ? 'No fue posible conectar con el servidor. Inténtalo en unos minutos.'
            : err.error?.message || 'Inténtalo nuevamente en unos minutos.',
        );
      },
    });
  }
}

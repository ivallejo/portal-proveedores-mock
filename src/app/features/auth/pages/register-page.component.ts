import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SapProvider, SapProviderService } from '../../providers/services/sap-provider.service';
import { CalloutComponent } from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { onlyDigits } from '../../../shared/utils/format';
import { AuthLayoutComponent } from '../components/auth-layout.component';
import {
  AuthBackLinkComponent,
  AuthHeadingComponent,
  AuthStepperComponent,
} from '../components/auth-ui.components';

type Step = 'ruc' | 'datos' | 'exito';

@Component({
  selector: 'app-register-page',
  imports: [
    AuthLayoutComponent,
    AuthBackLinkComponent,
    AuthHeadingComponent,
    AuthStepperComponent,
    CalloutComponent,
    IconComponent,
    SpinnerComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout
      heading="Únete a nuestra"
      accent="red de proveedores"
      description="Regístrate con el RUC de tu empresa y accede a tus órdenes, facturas y documentos en un solo lugar."
    >
      <app-auth-back-link />
      <app-auth-stepper
        [labels]="['RUC', 'Datos', 'Confirmación']"
        [current]="stepIndex()"
        [completed]="step() === 'exito'"
      />

      @switch (step()) {
        @case ('ruc') {
          <form class="animate-fade flex flex-col gap-5" (submit)="validate($event)" novalidate>
            <app-auth-heading icon="building" heading="Crea tu cuenta">
              Ingresa el RUC de tu empresa para validar que estás registrado como proveedor.
            </app-auth-heading>
            <div class="flex flex-col gap-2">
              <label for="rg-ruc" class="text-sm font-bold text-ink">RUC</label>
              <div class="relative flex">
                <app-icon
                  name="building"
                  [size]="20"
                  class="pointer-events-none absolute top-[15px] left-4 text-body-auth"
                />
                <input
                  id="rg-ruc"
                  type="text"
                  inputmode="numeric"
                  maxlength="11"
                  placeholder="Ingresa los 11 dígitos de tu RUC"
                  [value]="ruc()"
                  (input)="onRuc($event)"
                  [attr.aria-invalid]="!!rucError() || !!lookupError()"
                  aria-describedby="rg-ruc-help"
                  class="h-[50px] grow rounded-[10px] border bg-white pr-4 pl-12 text-[15px] tracking-[0.04em] text-ink tabular-nums outline-none focus:border-primary"
                  [class.border-field-auth]="!rucError() && !lookupError()"
                  [class.border-[#E04848]]="!!rucError() || !!lookupError()"
                />
              </div>
              <span
                id="rg-ruc-help"
                class="text-[13px]"
                [class]="rucError() ? 'text-danger-text' : 'text-muted-auth'"
                >{{ rucError() || 'Debe tener 11 dígitos.' }}</span
              >
            </div>
            @if (lookupError(); as failure) {
              <app-callout tone="danger" [heading]="failure.title">{{ failure.text }}</app-callout>
            }
            <button type="submit" class="btn btn-primary h-[52px] text-base" [disabled]="busy()">
              @if (busy()) {
                <app-spinner [size]="20" />Validando en SAP…
              } @else {
                <app-icon name="shield-check" [size]="20" />Validar
              }
            </button>
          </form>
        }
        @case ('datos') {
          <div class="animate-fade flex flex-col gap-5">
            <app-auth-heading icon="circle-check" heading="Confirma tus datos" [success]="true">
              Validamos tu RUC. Revisa que la información sea correcta antes de registrarte.
            </app-auth-heading>
            <dl class="m-0 overflow-hidden rounded-[14px] border border-line-auth">
              <div class="flex flex-col gap-1 border-b border-[#EEF2F8] px-[18px] py-3.5">
                <dt class="eyebrow">RUC</dt>
                <dd
                  class="m-0 flex items-center gap-2.5 text-base font-medium tracking-[0.04em] text-ink tabular-nums"
                >
                  <span>{{ provider()?.ruc }}</span>
                  <span
                    class="inline-flex h-6 items-center gap-[5px] rounded-full bg-success-soft px-[9px] text-xs font-bold tracking-normal text-success-text"
                    ><app-icon name="check" [size]="13" [stroke]="2.6" />Validado</span
                  >
                </dd>
              </div>
              <div class="flex flex-col gap-1 border-b border-[#EEF2F8] px-[18px] py-3.5">
                <dt class="eyebrow">Razón social</dt>
                <dd class="m-0 text-base font-medium text-ink">{{ provider()?.companyName }}</dd>
              </div>
              <div class="flex flex-col gap-1 bg-surface-auth px-[18px] py-3.5">
                <dt class="eyebrow">Correo electrónico</dt>
                <dd class="m-0 flex items-center gap-2 text-base font-medium text-ink">
                  <app-icon name="mail" [size]="18" class="text-primary" />{{ provider()?.email }}
                </dd>
              </div>
            </dl>
            <p class="-mt-1.5 mb-0 text-[13px] leading-normal text-muted-auth">
              Enviaremos a este correo un enlace para que crees tu contraseña. Al registrarte
              aceptas los términos y condiciones de uso del portal.
            </p>
            @if (registerError()) {
              <app-callout tone="danger" heading="No pudimos completar el registro">{{
                registerError()
              }}</app-callout>
            }
            <div class="flex flex-col gap-2.5">
              <button
                type="button"
                class="btn btn-primary h-[52px] text-base"
                [disabled]="busy()"
                (click)="register()"
              >
                @if (busy()) {
                  <app-spinner [size]="20" />Registrando…
                } @else {
                  <app-icon name="user-plus" [size]="20" />Registrar
                }
              </button>
              <button
                type="button"
                class="h-11 text-sm font-medium text-primary hover:text-primary-hover"
                (click)="restart()"
              >
                Usar otro RUC
              </button>
            </div>
          </div>
        }
        @case ('exito') {
          <div class="animate-fade flex flex-col gap-[22px]">
            <div class="flex flex-col items-center gap-[18px] pt-1.5 pb-1 text-center">
              <span
                class="flex size-[84px] items-center justify-center rounded-full bg-success-soft"
              >
                <span
                  class="animate-pop flex size-[58px] items-center justify-center rounded-full bg-success-bright text-white"
                >
                  <app-icon name="check" [size]="30" [stroke]="2.6" />
                </span>
              </span>
              <div class="flex flex-col gap-2">
                <h2 class="m-0 text-[30px] font-bold tracking-tight text-ink">
                  ¡Registro exitoso!
                </h2>
                <p class="m-0 text-[15px] leading-relaxed text-body-auth">
                  Te enviamos un correo a <strong class="text-ink">{{ sentTo() }}</strong> con un
                  enlace para que registres tu contraseña.
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
      }
    </app-auth-layout>
  `,
})
export class RegisterPageComponent {
  private readonly sap = inject(SapProviderService);

  readonly step = signal<Step>('ruc');
  readonly ruc = signal('');
  readonly rucError = signal('');
  readonly lookupError = signal<{ title: string; text: string } | null>(null);
  readonly registerError = signal('');
  readonly busy = signal(false);
  readonly provider = signal<SapProvider | null>(null);
  readonly sentTo = signal('');
  readonly stepIndex = computed(() => ({ ruc: 0, datos: 1, exito: 2 })[this.step()]);

  onRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = onlyDigits(input.value);
    input.value = value;
    this.ruc.set(value);
    this.rucError.set('');
    this.lookupError.set(null);
  }

  validate(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    if (this.ruc().length !== 11) {
      this.rucError.set('Ingresa un RUC de 11 dígitos.');
      return;
    }
    this.busy.set(true);
    this.sap.lookupByRuc(this.ruc()).subscribe({
      next: (provider) => {
        this.busy.set(false);
        this.provider.set(provider);
        this.step.set('datos');
      },
      error: (err) => {
        this.busy.set(false);
        if (err.status === 409) {
          this.lookupError.set({
            title: 'Usuario ya registrado',
            text: `${err.error?.message ?? 'Este RUC ya tiene una cuenta.'} Si olvidaste tu contraseña, usa la opción «¿Olvidaste tu contraseña?».`,
          });
        } else if (err.status === 0 || err.status >= 500) {
          this.lookupError.set({
            title: 'No pudimos validar el RUC',
            text: 'El servicio de consulta no está disponible en este momento. Inténtalo en unos minutos.',
          });
        } else {
          this.lookupError.set({
            title: 'RUC no válido',
            text: 'No encontramos este RUC en nuestro registro de proveedores. Verifica el número o comunícate con el área de Compras.',
          });
        }
      },
    });
  }

  register(): void {
    const provider = this.provider();
    if (!provider || this.busy()) return;
    this.registerError.set('');
    this.busy.set(true);
    this.sap.requestAccessKey(provider).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.sentTo.set(response.email || provider.email);
        this.step.set('exito');
      },
      error: (err) => {
        this.busy.set(false);
        this.registerError.set(err.error?.message || 'Inténtalo nuevamente en unos minutos.');
      },
    });
  }

  restart(): void {
    this.ruc.set('');
    this.provider.set(null);
    this.lookupError.set(null);
    this.registerError.set('');
    this.step.set('ruc');
  }
}

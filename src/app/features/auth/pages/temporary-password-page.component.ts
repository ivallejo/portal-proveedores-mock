import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CalloutComponent } from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { apiErrorMessage } from '../../../shared/documents/documents.service';
import { AuthLayoutComponent } from '../components/auth-layout.component';
import { AuthHeadingComponent, PasswordFieldComponent } from '../components/auth-ui.components';

/** Cambio obligatorio de la contraseña temporal entregada por el administrador. */
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
  template: `
    <app-auth-layout
      heading="Protege tu"
      accent="acceso al portal"
      description="Tu contraseña es temporal. Elige una nueva contraseña personal para continuar."
    >
      <form class="animate-fade flex flex-col gap-5" (submit)="submit($event)" novalidate>
        <app-auth-heading icon="lock" heading="Cambia tu contraseña temporal">
          Hola, <strong class="text-ink">{{ auth.user()?.name }}</strong
          >. Por seguridad debes definir tu propia contraseña antes de usar el portal.
        </app-auth-heading>

        <app-password-field
          inputId="pw-new"
          label="Nueva contraseña"
          placeholder="Nueva contraseña"
          autocomplete="new-password"
          [invalid]="error() === 'rules'"
          [(value)]="password"
        />
        <app-password-field
          inputId="pw-confirm"
          label="Confirmar nueva contraseña"
          placeholder="Confirmar nueva contraseña"
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
                  : error() === 'rules'
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
          @case ('rules') {
            <app-callout tone="danger" heading="La contraseña no cumple los requisitos">
              Debe tener mínimo 8 caracteres, una letra mayúscula, una minúscula y un número, y ser
              distinta de la temporal.
            </app-callout>
          }
          @case ('mismatch') {
            <app-callout tone="danger" heading="Las contraseñas no coinciden">
              Verifica que la nueva contraseña y su confirmación sean iguales.
            </app-callout>
          }
          @case ('server') {
            <app-callout tone="danger" heading="No pudimos cambiar la contraseña">{{
              serverError()
            }}</app-callout>
          }
        }

        <button type="submit" class="btn btn-primary h-[52px] text-base" [disabled]="busy()">
          @if (busy()) {
            <app-spinner [size]="20" />Guardando…
          } @else {
            <app-icon name="lock" [size]="20" />Cambiar contraseña
          }
        </button>
        <button
          type="button"
          class="h-11 text-sm font-medium text-primary hover:text-primary-hover"
          (click)="logout()"
        >
          Cerrar sesión
        </button>
      </form>
    </app-auth-layout>
  `,
})
export class TemporaryPasswordPageComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly password = signal('');
  readonly confirmation = signal('');
  readonly error = signal<'' | 'rules' | 'mismatch' | 'server'>('');
  readonly serverError = signal('');
  readonly busy = signal(false);

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
    if (!this.rules().every((rule) => rule.ok)) {
      return this.error.set('rules');
    }
    if (this.password() !== this.confirmation()) return this.error.set('mismatch');
    this.error.set('');
    this.busy.set(true);
    // La sesión se abrió con la contraseña temporal: el backend no la vuelve a pedir.
    this.auth.changePassword(this.password()).subscribe({
      next: () => {
        this.busy.set(false);
        void this.router.navigateByUrl(this.auth.landingPath());
      },
      error: (error) => {
        this.busy.set(false);
        this.serverError.set(apiErrorMessage(error, 'Inténtalo nuevamente en unos minutos.'));
        this.error.set('server');
      },
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

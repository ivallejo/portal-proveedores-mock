import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LOOKUP_PROVIDER, REQUEST_ACCESS_KEY } from '../../../di/auth.tokens';
import { ProviderLookupError } from '../../../domain/errors/provider-lookup.error';
import { ProviderCandidate } from '../../../domain/models/provider-candidate';
import { userFacingMessage } from '../../../../../shared/errors/user-facing-message';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { onlyDigits } from '../../../../../shared/utils/text-format.util';
import { AuthLayoutComponent } from '../../../../../shared/ui/auth-layout/auth-layout.component';
import { AuthBackLinkComponent } from '../../components/auth-back-link/auth-back-link.component';
import { AuthHeadingComponent } from '../../../../../shared/ui/auth-heading/auth-heading.component';
import { AuthStepperComponent } from '../../components/auth-stepper/auth-stepper.component';
import { RegisterStep } from './register-step';

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
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  private readonly lookupProvider = inject(LOOKUP_PROVIDER);
  private readonly requestAccessKey = inject(REQUEST_ACCESS_KEY);

  readonly step = signal<RegisterStep>('ruc');
  readonly ruc = signal('');
  readonly rucError = signal('');
  readonly lookupError = signal<{ title: string; text: string } | null>(null);
  readonly registerError = signal('');
  readonly busy = signal(false);
  readonly provider = signal<ProviderCandidate | null>(null);
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
    this.lookupProvider.execute(this.ruc()).subscribe({
      next: (provider) => {
        this.busy.set(false);
        this.provider.set(provider);
        this.step.set('datos');
      },
      error: (err) => {
        this.busy.set(false);
        const failure =
          err instanceof ProviderLookupError ? err : new ProviderLookupError('not-found');
        if (failure.failure === 'already-registered') {
          this.lookupError.set({
            title: 'Usuario ya registrado',
            text: `${failure.message || 'Este RUC ya tiene una cuenta.'} Si olvidaste tu contraseña, usa la opción «¿Olvidaste tu contraseña?».`,
          });
        } else if (failure.failure === 'cannot-register') {
          // El RUC existe en SAP pero falta un dato para registrarlo (por ejemplo, el correo).
          this.lookupError.set({ title: 'No podemos registrar este RUC', text: failure.message });
        } else if (failure.failure === 'unavailable') {
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
    this.requestAccessKey.execute(provider).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.sentTo.set(response.email || provider.email);
        this.step.set('exito');
      },
      error: (err) => {
        this.busy.set(false);
        this.registerError.set(userFacingMessage(err, 'Inténtalo nuevamente en unos minutos.'));
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

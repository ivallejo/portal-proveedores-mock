import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CalloutComponent } from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AuthLayoutComponent } from '../components/auth-layout.component';
import { PasswordFieldComponent } from '../components/auth-ui.components';

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
  template: `
    <app-auth-layout
      heading="Juntos impulsamos"
      accent="grandes proyectos"
      description="Accede a tu información, consulta el estado de tus documentos y mantente al día con tus procesos."
    >
      <form class="flex flex-col gap-5" (submit)="submit($event)" novalidate>
        <div class="flex items-center gap-3">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M24 3l18 10.4v21.2L24 45 6 34.6V13.4z" fill="#1668E3" />
            <path d="M24 13l9 5.2v10.4L24 34l-9-5.4V18.2z" fill="#FFFFFF" />
            <path d="M24 13l9 5.2-9 5.2-9-5.2z" fill="#BFD6FF" />
          </svg>
          <span class="text-[21px] font-bold text-ink">Portal de Proveedores</span>
        </div>
        <div class="flex flex-col gap-1.5">
          <h2 class="m-0 text-[30px] font-bold tracking-tight text-ink sm:text-[34px]">
            Bienvenido
          </h2>
          <p class="m-0 text-base leading-normal text-body-auth">
            Ingresa con tu usuario o RUC para acceder a tu portal de proveedores.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <label for="login-user" class="text-sm font-bold text-ink">RUC o usuario</label>
          <div class="relative flex">
            <app-icon
              name="user"
              [size]="20"
              class="pointer-events-none absolute top-[15px] left-4 text-body-auth"
            />
            <input
              id="login-user"
              type="text"
              autocomplete="username"
              placeholder="Ingresa tu RUC o usuario"
              [value]="identifier()"
              (input)="identifier.set($any($event.target).value)"
              class="h-[50px] grow rounded-[10px] border border-field-auth bg-white pr-4 pl-12 text-[15px] text-ink outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(22,104,227,0.14)]"
            />
          </div>
        </div>

        <app-password-field inputId="login-pass" [(value)]="password" />

        <div class="-mt-1 flex justify-end">
          <a
            routerLink="/recuperar-contrasena"
            class="text-sm font-medium text-primary no-underline hover:text-primary-hover"
            >¿Olvidaste tu contraseña?</a
          >
        </div>

        @if (error()) {
          <app-callout tone="danger" heading="No pudimos iniciar sesión">{{ error() }}</app-callout>
        }

        <button
          type="submit"
          class="btn h-[52px] text-base"
          [class.btn-primary]="!loading()"
          [class.bg-primary-busy]="loading()"
          [class.text-white]="loading()"
          [attr.aria-busy]="loading()"
        >
          @if (loading()) {
            <app-spinner [size]="20" />Ingresando…
          } @else {
            <app-icon name="arrow-right" [size]="20" [stroke]="2.2" />Ingresar
          }
        </button>

        <div class="flex items-center gap-3.5 text-sm text-muted-auth">
          <span class="h-px grow bg-line-auth"></span>¿No tienes una cuenta?<span
            class="h-px grow bg-line-auth"
          ></span>
        </div>

        <a routerLink="/registro" class="btn btn-outline h-[50px] text-[15px]">
          <app-icon name="user-plus" [size]="20" [stroke]="1.9" />Regístrate aquí
        </a>
      </form>
    </app-auth-layout>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
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
    this.auth.login(identifier, this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // Con contraseña temporal el único destino posible es el cambio de contraseña.
        void this.router.navigateByUrl(
          returnUrl?.startsWith('/') && !this.auth.user()?.mustChangePassword
            ? returnUrl
            : this.auth.landingPath(),
        );
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 0
            ? 'No fue posible conectar con el servidor. Inténtalo en unos minutos.'
            : err.error?.message || 'Usuario o contraseña incorrectos.',
        );
      },
    });
  }
}

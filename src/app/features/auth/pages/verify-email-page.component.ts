import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CalloutComponent } from '../../../shared/ui/callout/callout.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ProfileService } from '../../profile/profile.service';
import { AuthLayoutComponent } from '../components/auth-layout.component';
import { AuthHeadingComponent } from '../components/auth-ui.components';

/** Destino del enlace «Verificar mi correo» (no requiere sesión). */
@Component({
  selector: 'app-verify-email-page',
  imports: [
    AuthLayoutComponent,
    AuthHeadingComponent,
    CalloutComponent,
    SpinnerComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout
      heading="Confirma tu"
      accent="correo"
      description="Los correos verificados reciben las notificaciones del portal y sirven para ingresar."
    >
      @switch (state()) {
        @case ('loading') {
          <div class="flex items-center gap-3 text-sm text-muted" role="status">
            <app-spinner [size]="20" /> Verificando tu correo…
          </div>
        }
        @case ('done') {
          <app-auth-heading icon="circle-check" heading="¡Correo verificado!" [success]="true">
            <strong class="text-ink">{{ email() }}</strong> quedó verificado. Ya puedes usarlo como
            correo principal desde Mi perfil.
          </app-auth-heading>
          <a
            [routerLink]="auth.user() ? '/perfil' : '/login'"
            class="btn btn-primary h-[52px] text-base"
          >
            {{ auth.user() ? 'Ir a Mi perfil' : 'Ingresar al portal' }}
          </a>
        }
        @case ('error') {
          <app-callout tone="danger" heading="Enlace no válido">
            El enlace es inválido o ya venció. Desde Mi perfil › Mis correos puedes pedir uno nuevo
            con «Reenviar verificación».
          </app-callout>
          <a
            [routerLink]="auth.user() ? '/perfil' : '/login'"
            class="btn btn-primary h-[52px] text-base"
          >
            {{ auth.user() ? 'Ir a Mi perfil' : 'Ingresar al portal' }}
          </a>
        }
      }
    </app-auth-layout>
  `,
})
export class VerifyEmailPageComponent {
  readonly auth = inject(AuthService);
  readonly state = signal<'loading' | 'done' | 'error'>('loading');
  readonly email = signal('');

  constructor() {
    const token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.state.set('error');
      return;
    }
    inject(ProfileService)
      .verifyEmail(token)
      .subscribe({
        next: ({ email }) => {
          this.email.set(email);
          this.state.set('done');
        },
        error: () => this.state.set('error'),
      });
  }
}

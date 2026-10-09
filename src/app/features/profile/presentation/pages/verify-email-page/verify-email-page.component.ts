import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CalloutComponent } from '../../../../../shared/ui/callout/callout.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AuthHeadingComponent } from '../../../../../shared/ui/auth-heading/auth-heading.component';
import { AuthLayoutComponent } from '../../../../../shared/ui/auth-layout/auth-layout.component';
import { SessionFacade } from '../../../../auth';
import { VERIFY_EMAIL } from '../../../di/profile.tokens';

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
  templateUrl: './verify-email-page.component.html',
})
export class VerifyEmailPageComponent {
  readonly auth = inject(SessionFacade);
  readonly state = signal<'loading' | 'done' | 'error'>('loading');
  readonly email = signal('');

  constructor() {
    const token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.state.set('error');
      return;
    }
    inject(VERIFY_EMAIL)
      .execute(token)
      .subscribe({
        next: ({ email }) => {
          this.email.set(email);
          this.state.set('done');
        },
        error: () => this.state.set('error'),
      });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { NavigationService, Screen } from '../../../../core/navigation/navigation.service';
import { SapProviderService } from '../../../providers/services/sap-provider.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  readonly auth = inject(AuthService);
  readonly navigation = inject(NavigationService);
  readonly sapProviderService = inject(SapProviderService);
  readonly username = signal(environment.defaultLoginUsername);
  readonly password = signal(environment.defaultLoginPassword);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);
  readonly showRegistration = signal(false);
  readonly forgotMode = signal(false);
  readonly forgotSent = signal(false);
  readonly forgotLoading = signal(false);
  readonly forgotError = signal('');
  readonly forgotRuc = signal('');
  readonly forgotEmail = signal('');
  readonly passwordChangeMode = signal(false);
  readonly passwordChangeCompleted = signal(false);
  readonly passwordChangeLoading = signal(false);
  readonly passwordChangeError = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly registrationLoading = signal(false);
  readonly registrationSapLoading = signal(false);
  readonly registrationMessage = signal('');
  readonly registrationCompleted = signal(false);
  readonly registrationValidated = signal(false);
  readonly registrationTermsAccepted = signal(false);
  readonly registrationKeyRequested = signal(false);
  readonly registration = { ruc: '20523682785', email: '', company: '' };

  login(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.username(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.navigation.goTo(this.landingScreen());
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }
  quickLogin(username: string): void {
    this.username.set(username);
    this.password.set('123456');
    this.login();
  }
  openRegistration(): void {
    this.forgotMode.set(false);
    this.registrationMessage.set('');
    this.registrationCompleted.set(false);
    this.registrationValidated.set(false);
    this.registrationTermsAccepted.set(false);
    this.registrationKeyRequested.set(false);
    this.registration.ruc = '20523682785';
    this.registration.company = '';
    this.registration.email = '';
    this.showRegistration.set(true);
  }
  closeRegistration(): void {
    this.showRegistration.set(false);
    this.registrationMessage.set('');
    this.registrationCompleted.set(false);
    this.registrationValidated.set(false);
    this.registrationKeyRequested.set(false);
  }
  openForgotPassword(): void {
    this.error.set('');
    this.forgotError.set('');
    this.forgotSent.set(false);
    this.forgotRuc.set('');
    this.forgotEmail.set('');
    this.showRegistration.set(false);
    this.forgotMode.set(true);
  }
  closeForgotPassword(): void {
    this.forgotMode.set(false);
    this.forgotSent.set(false);
    this.forgotError.set('');
  }
  openPasswordChange(): void {
    this.forgotMode.set(false);
    this.passwordChangeCompleted.set(false);
    this.passwordChangeError.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordChangeMode.set(true);
  }
  closePasswordChange(): void {
    this.passwordChangeMode.set(false);
    this.passwordChangeCompleted.set(false);
    this.passwordChangeError.set('');
  }
  changePassword(): void {
    const password = this.newPassword();
    const confirmation = this.confirmPassword();
    this.passwordChangeError.set('');
    if (!this.hasValidPassword(password)) {
      this.passwordChangeError.set('La contraseña no cumple todos los requisitos.');
      return;
    }
    if (password !== confirmation) {
      this.passwordChangeError.set('Las contraseñas no coinciden');
      return;
    }
    this.passwordChangeLoading.set(true);
    window.setTimeout(() => {
      this.auth.updatePassword(this.forgotRuc(), password);
      this.passwordChangeLoading.set(false);
      this.passwordChangeCompleted.set(true);
    }, 700);
  }
  hasMinPasswordLength(): boolean {
    return this.newPassword().length >= 6;
  }
  hasUppercasePassword(): boolean {
    return /[A-Z]/.test(this.newPassword());
  }
  hasLowercasePassword(): boolean {
    return /[a-z]/.test(this.newPassword());
  }
  hasNumberPassword(): boolean {
    return /\d/.test(this.newPassword());
  }
  hasValidPassword(password: string): boolean {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  }
  requestPasswordReset(): void {
    const ruc = this.forgotRuc().replace(/\D/g, '');
    this.forgotRuc.set(ruc);
    this.forgotError.set('');
    if (ruc.length !== 11) {
      this.forgotError.set('El RUC debe tener 11 dígitos.');
      return;
    }
    this.forgotLoading.set(true);
    this.sapProviderService.lookupByRuc(ruc).subscribe({
      next: (provider) => {
        this.forgotEmail.set(provider.email);
        this.forgotLoading.set(false);
        this.forgotSent.set(true);
      },
      error: (error) => {
        this.forgotLoading.set(false);
        this.forgotError.set(error.message || 'No encontramos información para el RUC indicado.');
      },
    });
  }
  onRegistrationRucChange(value: string): void {
    this.registration.ruc = value;
    if (this.registrationValidated()) {
      this.registrationValidated.set(false);
      this.registrationTermsAccepted.set(false);
      this.registration.company = '';
      this.registration.email = '';
      this.registrationMessage.set('');
    }
  }
  finishRegistration(): void {
    this.username.set(this.registration.ruc);
    this.password.set('');
    this.showRegistration.set(false);
    this.registrationCompleted.set(false);
    this.registrationKeyRequested.set(false);
  }
  register(): void {
    if (!this.registrationValidated()) {
      this.registrationMessage.set('Primero valida el RUC para continuar.');
      return;
    }
    if (!this.registrationTermsAccepted()) {
      this.registrationMessage.set('Debes aceptar los términos y condiciones.');
      return;
    }
    this.registrationLoading.set(true);
    this.registrationMessage.set('');
    this.sapProviderService
      .requestAccessKey({
        ruc: this.registration.ruc,
        companyName: this.registration.company,
        email: this.registration.email,
      })
      .subscribe({
        next: () => {
          this.registrationLoading.set(false);
          this.registrationKeyRequested.set(true);
        },
        error: (err) => {
          this.registrationLoading.set(false);
          this.registrationMessage.set(
            err.error?.message || 'No fue posible completar el registro.',
          );
        },
      });
  }
  validateRegistrationRuc(): void {
    this.registrationMessage.set('');
    this.registrationValidated.set(false);
    this.registration.ruc = this.registration.ruc.replace(/\D/g, '');
    if (!this.registration.ruc) {
      this.registrationMessage.set('Ingresa el RUC para continuar.');
      return;
    }
    if (this.registration.ruc.length !== 11) {
      this.registrationMessage.set('El RUC debe tener 11 dígitos.');
      return;
    }
    this.registrationSapLoading.set(true);
    this.sapProviderService.lookupByRuc(this.registration.ruc).subscribe({
      next: (provider) => {
        this.registration.company = provider.companyName;
        this.registration.email = provider.email;
        this.registrationValidated.set(true);
        this.registrationSapLoading.set(false);
      },
      error: (error) => {
        this.registrationSapLoading.set(false);
        this.registrationMessage.set(
          error.message || 'No encontramos información para el RUC indicado.',
        );
      },
    });
  }
  private landingScreen(): Screen {
    const role = this.auth.user()?.role;
    if (role === 'Colaborador interno') return 'registrar';
    if (role === 'Área Usuaria') return 'aprobaciones';
    if (role === 'CxP') return 'contabilizacion';
    return 'dashboard';
  }
}

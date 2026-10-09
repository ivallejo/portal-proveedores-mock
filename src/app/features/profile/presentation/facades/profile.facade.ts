import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { initials } from '../../../../shared/utils/text-format.util';
import { SessionFacade, normalizeRole, passwordRules, roleLabel } from '../../../auth';
import {
  ADD_PROFILE_EMAIL,
  GET_PROFILE,
  MAKE_PRIMARY_EMAIL,
  REMOVE_PROFILE_EMAIL,
  RESEND_EMAIL_VERIFICATION,
  UPDATE_PROFILE,
} from '../../di/profile.tokens';
import { PersonalData } from '../../domain/models/personal-data';
import { PersonalDataErrors } from '../../domain/models/personal-data-errors';
import { PersonalDataField } from '../../domain/models/personal-data-field';
import { Profile } from '../../domain/models/profile';
import { ProfileEmail } from '../../domain/models/profile-email';
import { ProfileEmailType } from '../../domain/models/profile-email-type';
import {
  accessIdOf,
  isPersonalDataDirty,
  newProfileEmailError,
  passwordStrength,
  personalDataChanges,
  personalDataErrors,
  personalDataOf,
  primaryEmailOf,
  taxpayerTypeOf,
} from '../../domain/rules/profile-rules';
import {
  PASSWORD_STRENGTH_COLORS,
  PASSWORD_STRENGTH_LABELS,
} from '../catalog/password-strength-styles';
import { PROFILE_EMAIL_TYPES } from '../catalog/profile-email-types';
import { ROLE_DESCRIPTIONS } from '../catalog/role-descriptions';
import { PasswordChangeErrors } from './password-change-errors';
import { ProfileTab } from './profile-tab';

/** Estado de Mi perfil: el perfil cargado y las pestañas Datos personales, Mis correos y Contraseña. */
@Injectable()
export class ProfileFacade {
  private readonly getProfile = inject(GET_PROFILE);
  private readonly updateProfile = inject(UPDATE_PROFILE);
  private readonly addProfileEmail = inject(ADD_PROFILE_EMAIL);
  private readonly resendEmailVerification = inject(RESEND_EMAIL_VERIFICATION);
  private readonly makePrimaryEmail = inject(MAKE_PRIMARY_EMAIL);
  private readonly removeProfileEmail = inject(REMOVE_PROFILE_EMAIL);
  private readonly session = inject(SessionFacade);
  private readonly toast = inject(ToastService);

  readonly profile = signal<Profile | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly tab = signal<ProfileTab>(
    this.session.user()?.mustChangePassword ? 'password' : 'personal-data',
  );

  // ——— Datos personales ———
  readonly form = signal<PersonalData>({ businessName: '', firstName: '', lastName: '' });
  readonly errors = signal<PersonalDataErrors>({});
  readonly saving = signal(false);
  readonly saveError = signal('');

  // ——— Mis correos ———
  readonly newEmail = signal('');
  readonly newType = signal<ProfileEmailType>('work');
  readonly emailError = signal('');
  readonly adding = signal(false);
  /** Correo con una acción en curso (verificar, hacer principal, eliminar). */
  readonly busyEmail = signal('');
  readonly confirmRemove = signal<ProfileEmail | null>(null);

  // ——— Contraseña ———
  readonly current = signal('');
  readonly password = signal('');
  readonly confirmation = signal('');
  readonly passwordErrors = signal<PasswordChangeErrors>({});
  readonly passwordSaving = signal(false);
  readonly passwordDone = signal(false);

  readonly busy = computed(
    () =>
      this.loading() ||
      this.saving() ||
      this.adding() ||
      !!this.busyEmail() ||
      this.passwordSaving(),
  );

  readonly role = computed(() => {
    const name = this.profile()?.roles[0] ?? '';
    const role = normalizeRole(name);
    return {
      label: role ? roleLabel(role) : name || '—',
      description: (role && ROLE_DESCRIPTIONS[role]) || '',
    };
  });

  readonly avatar = computed(() => initials(this.profile()?.displayName ?? ''));

  readonly accessId = computed(() => {
    const profile = this.profile();
    return profile ? accessIdOf(profile) : '';
  });

  readonly taxpayerType = computed(() => taxpayerTypeOf(this.profile()?.ruc ?? null));

  readonly primaryEmail = computed(() => {
    const profile = this.profile();
    return (profile && primaryEmailOf(profile)) ?? '—';
  });

  readonly dirty = computed(() => {
    const profile = this.profile();
    return !!profile && isPersonalDataDirty(profile, this.form());
  });

  readonly errorCount = computed(() => Object.keys(this.errors()).length);

  readonly rules = computed(() => passwordRules(this.password()));

  readonly strength = computed(() =>
    passwordStrength(this.password(), this.rules().filter((rule) => rule.ok).length),
  );

  readonly strengthLabel = computed(() => PASSWORD_STRENGTH_LABELS[this.strength()]);

  readonly strengthColor = computed(() => PASSWORD_STRENGTH_COLORS[this.strength()]);

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.getProfile.execute().subscribe({
      next: (profile) => {
        this.apply(profile);
        this.loading.set(false);
      },
      error: (error) => {
        this.loadError.set(userFacingMessage(error, 'No pudimos cargar tu perfil.'));
        this.loading.set(false);
      },
    });
  }

  selectTab(tab: ProfileTab): void {
    this.tab.set(tab);
    this.confirmRemove.set(null);
  }

  emailTypeLabel(type: ProfileEmailType): string {
    return PROFILE_EMAIL_TYPES.find((item) => item.value === type)?.label ?? type;
  }

  // ——— Datos personales ———

  setField(field: PersonalDataField, value: string): void {
    this.form.update((form) => ({ ...form, [field]: value }));
    this.errors.update((errors) => {
      const next = { ...errors };
      delete next[field];
      return next;
    });
    this.saveError.set('');
  }

  discard(): void {
    const profile = this.profile();
    if (profile) this.resetForm(profile);
  }

  save(): void {
    const profile = this.profile();
    if (!profile || !this.dirty() || this.saving()) return;
    const form = this.form();
    const errors = personalDataErrors(profile.isProvider, form);
    this.errors.set(errors);
    if (Object.keys(errors).length) return;

    this.saving.set(true);
    this.updateProfile.execute(personalDataChanges(profile.isProvider, form)).subscribe({
      next: (updated) => {
        this.apply(updated);
        this.saving.set(false);
        this.toast.show('Tus datos se actualizaron correctamente.', 3200);
      },
      error: (error) => {
        this.saveError.set(userFacingMessage(error, 'No pudimos guardar tus datos.'));
        this.saving.set(false);
      },
    });
  }

  // ——— Mis correos ———

  setNewEmail(value: string): void {
    this.newEmail.set(value);
    this.emailError.set('');
  }

  addEmail(): void {
    if (this.adding()) return;
    const email = this.newEmail().trim().toLowerCase();
    const error = newProfileEmailError(email, this.profile()?.emails ?? []);
    if (error) return this.emailError.set(error);
    this.adding.set(true);
    this.emailError.set('');
    this.addProfileEmail.execute(email, this.newType()).subscribe({
      next: (profile) => {
        this.apply(profile);
        this.adding.set(false);
        this.newEmail.set('');
        this.toast.show(`Agregamos ${email}. Revisa tu bandeja para verificarlo.`, 4000);
      },
      error: (failure) => {
        this.emailError.set(userFacingMessage(failure, 'No pudimos agregar el correo.'));
        this.adding.set(false);
      },
    });
  }

  resend(email: ProfileEmail): void {
    this.emailAction(
      email,
      this.resendEmailVerification.execute(email.id),
      `Enviamos un enlace de verificación a ${email.email}.`,
    );
  }

  makePrimary(email: ProfileEmail): void {
    if (!email.isVerified) return;
    this.emailAction(
      email,
      this.makePrimaryEmail.execute(email.id),
      `${email.email} ahora es tu correo principal.`,
    );
  }

  askRemove(email: ProfileEmail): void {
    if (!email.isPrimary) this.confirmRemove.set(email);
  }

  remove(): void {
    const email = this.confirmRemove();
    if (!email) return;
    this.confirmRemove.set(null);
    this.emailAction(
      email,
      this.removeProfileEmail.execute(email.id),
      `Eliminamos ${email.email} de tu perfil.`,
    );
  }

  // ——— Contraseña ———

  changePassword(): void {
    if (this.passwordSaving()) return;
    const mustChange = this.profile()?.mustChangePassword ?? false;
    const errors: PasswordChangeErrors = {};
    if (!mustChange && !this.current()) errors.current = 'Ingresa tu contraseña actual.';
    if (!this.rules().every((rule) => rule.ok)) errors.rules = true;
    if (this.password() !== this.confirmation()) errors.mismatch = true;
    this.passwordErrors.set(errors);
    this.passwordDone.set(false);
    if (Object.keys(errors).length) return;

    this.passwordSaving.set(true);
    this.session
      .changePassword(this.password(), mustChange ? undefined : this.current())
      .subscribe({
        next: () => {
          this.passwordSaving.set(false);
          this.passwordDone.set(true);
          this.current.set('');
          this.password.set('');
          this.confirmation.set('');
          this.toast.show('Tu contraseña se actualizó correctamente.', 3200);
          this.getProfile.execute().subscribe((profile) => this.apply(profile));
        },
        error: (error) => {
          this.passwordSaving.set(false);
          this.passwordErrors.set({
            current: userFacingMessage(error, 'No pudimos cambiar tu contraseña.'),
          });
        },
      });
  }

  private emailAction(email: ProfileEmail, request: Observable<Profile>, message: string): void {
    if (this.busyEmail()) return;
    this.busyEmail.set(email.id);
    request.subscribe({
      next: (profile) => {
        this.apply(profile);
        this.busyEmail.set('');
        this.toast.show(message, 3600);
      },
      error: (error) => {
        this.busyEmail.set('');
        this.toast.show(userFacingMessage(error, 'No pudimos completar la acción.'), 4000);
      },
    });
  }

  /** Muestra el perfil recibido y mantiene el nombre y el correo del encabezado al día. */
  private apply(profile: Profile): void {
    this.profile.set(profile);
    this.resetForm(profile);
    this.session.updateIdentity(profile.displayName, primaryEmailOf(profile) ?? '');
  }

  private resetForm(profile: Profile): void {
    this.form.set(personalDataOf(profile));
    this.errors.set({});
    this.saveError.set('');
  }
}

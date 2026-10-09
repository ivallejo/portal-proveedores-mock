import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import { apiErrorMessage } from '../../core/http/api-error-message';
import { normalizeRole, roleLabel } from '../../shared/models/models';
import { CalloutComponent } from '../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page/page.components';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { initials } from '../../shared/utils/format';
import { PasswordFieldComponent } from '../auth/components/auth-ui.components';
import { EmailType, Profile, ProfileEmail, ProfileService } from './profile.service';

type Tab = 'datos' | 'correos' | 'clave';
type DataErrors = Partial<Record<'businessName' | 'firstName' | 'lastName', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PERSON_NAME = /^[\p{L}' .-]+$/u;

export const EMAIL_TYPES: { value: EmailType; label: string }[] = [
  { value: 'work', label: 'Trabajo' },
  { value: 'billing', label: 'Facturación' },
  { value: 'personal', label: 'Personal' },
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Proveedor: 'Consulta órdenes, pagos y facturas; registra documentos.',
  'Colaborador interno': 'Registra documentos sin orden de compra y documentos especiales.',
  'Área Usuaria': 'Revisa y aprueba documentos sin orden de compra.',
  CxP: 'Contabiliza, observa o rechaza documentos aprobados.',
  Administrador: 'Acceso total, incluida la configuración del portal.',
};

/** «dd/mm/aaaa hh:mm» en hora local. */
function stamp(iso: string | null, withTime = true): string {
  if (!iso) return '—';
  const date = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

/** Mi perfil: resumen, datos de la cuenta y pestañas Datos personales, Mis correos y Contraseña. */
@Component({
  selector: 'app-profile-page',
  imports: [
    PageHeaderComponent,
    IconComponent,
    CalloutComponent,
    SpinnerComponent,
    PasswordFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly api = inject(ProfileService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly emailTypes = EMAIL_TYPES;
  readonly stamp = stamp;

  readonly profile = signal<Profile | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly tab = signal<Tab>('datos');

  // ——— Datos personales ———
  readonly form = signal({ businessName: '', firstName: '', lastName: '' });
  readonly errors = signal<DataErrors>({});
  readonly saving = signal(false);
  readonly saveError = signal('');

  // ——— Mis correos ———
  readonly newEmail = signal('');
  readonly newType = signal<EmailType>('work');
  readonly emailError = signal('');
  readonly adding = signal(false);
  /** Correo con una acción en curso (verificar, hacer principal, eliminar). */
  readonly busyEmail = signal('');
  readonly confirmRemove = signal<ProfileEmail | null>(null);

  // ——— Contraseña ———
  readonly current = signal('');
  readonly password = signal('');
  readonly confirmation = signal('');
  readonly passwordErrors = signal<{ current?: string; rules?: boolean; mismatch?: boolean }>({});
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

  /** «DNI 45678123», «RUC 20…» o el usuario si no es un documento. */
  readonly accessId = computed(() => {
    const profile = this.profile();
    if (!profile) return '';
    if (profile.isProvider && profile.ruc) return `RUC ${profile.ruc}`;
    return /^\d{8}$/.test(profile.username) ? `DNI ${profile.username}` : profile.username;
  });

  readonly taxpayerType = computed(() =>
    this.profile()?.ruc?.startsWith('10') ? 'Persona natural con negocio' : 'Persona jurídica',
  );

  readonly primaryEmail = computed(
    () => this.profile()?.emails.find((email) => email.isPrimary)?.email ?? '—',
  );

  readonly dirty = computed(() => {
    const profile = this.profile();
    if (!profile) return false;
    const form = this.form();
    return profile.isProvider
      ? form.businessName !== (profile.businessName ?? '')
      : form.firstName !== (profile.firstName ?? '') || form.lastName !== (profile.lastName ?? '');
  });

  readonly errorCount = computed(() => Object.keys(this.errors()).length);

  readonly rules = computed(() => {
    const value = this.password();
    return [
      { label: 'Mínimo 8 caracteres', ok: value.length >= 8 },
      { label: 'Una letra mayúscula', ok: /[A-ZÁÉÍÓÚÑ]/.test(value) },
      { label: 'Una letra minúscula', ok: /[a-záéíóúñ]/.test(value) },
      { label: 'Un número', ok: /\d/.test(value) },
    ];
  });

  /** 0 = vacía, 1 débil, 2 media, 3 buena, 4 fuerte. */
  readonly strength = computed(() => {
    const value = this.password();
    if (!value) return 0;
    const score = this.rules().filter((rule) => rule.ok).length + (value.length >= 12 ? 1 : 0);
    return score <= 2 ? 1 : score === 3 ? 2 : score === 4 ? 3 : 4;
  });

  readonly strengthLabel = computed(
    () => ['Escribe una contraseña', 'Débil', 'Media', 'Buena', 'Fuerte'][this.strength()],
  );

  readonly strengthColor = computed(
    () => ['bg-line', 'bg-danger', 'bg-warning', 'bg-primary', 'bg-success'][this.strength()],
  );

  constructor() {
    inject(PageLoadingService).bind(this.busy, 'Cargando tu perfil');
    if (this.auth.user()?.mustChangePassword) this.tab.set('clave');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.api.get().subscribe({
      next: (profile) => {
        this.apply(profile);
        this.loading.set(false);
      },
      error: (error) => {
        this.loadError.set(apiErrorMessage(error, 'No pudimos cargar tu perfil.'));
        this.loading.set(false);
      },
    });
  }

  emailTypeLabel(type: EmailType): string {
    return EMAIL_TYPES.find((item) => item.value === type)?.label ?? type;
  }

  // ——— Datos personales ———

  setField(field: 'businessName' | 'firstName' | 'lastName', value: string): void {
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
    const errors: DataErrors = {};
    if (profile.isProvider) {
      if (!form.businessName.trim()) errors.businessName = 'Ingresa la razón social.';
      else if (form.businessName.trim().length < 3)
        errors.businessName = 'La razón social debe tener al menos 3 caracteres.';
    } else {
      if (!form.firstName.trim()) errors.firstName = 'Ingresa tus nombres.';
      else if (!PERSON_NAME.test(form.firstName.trim())) errors.firstName = 'Usa solo letras.';
      if (!form.lastName.trim()) errors.lastName = 'Ingresa tus apellidos.';
      else if (!PERSON_NAME.test(form.lastName.trim())) errors.lastName = 'Usa solo letras.';
    }
    this.errors.set(errors);
    if (Object.keys(errors).length) return;

    this.saving.set(true);
    const input = profile.isProvider
      ? { businessName: form.businessName.trim() }
      : { firstName: form.firstName.trim(), lastName: form.lastName.trim() };
    this.api.update(input).subscribe({
      next: (updated) => {
        this.apply(updated);
        this.saving.set(false);
        this.toast.show('Tus datos se actualizaron correctamente.', 3200);
      },
      error: (error) => {
        this.saveError.set(apiErrorMessage(error, 'No pudimos guardar tus datos.'));
        this.saving.set(false);
      },
    });
  }

  // ——— Mis correos ———

  addEmail(): void {
    if (this.adding()) return;
    const email = this.newEmail().trim().toLowerCase();
    if (!EMAIL.test(email))
      return this.emailError.set('Ingresa un correo válido, por ejemplo nombre@empresa.com.');
    if (this.profile()?.emails.some((item) => item.email === email))
      return this.emailError.set('Este correo ya está registrado en tu perfil.');
    this.adding.set(true);
    this.emailError.set('');
    this.api.addEmail(email, this.newType()).subscribe({
      next: (profile) => {
        this.apply(profile);
        this.adding.set(false);
        this.newEmail.set('');
        this.toast.show(`Agregamos ${email}. Revisa tu bandeja para verificarlo.`, 4000);
      },
      error: (error) => {
        this.emailError.set(apiErrorMessage(error, 'No pudimos agregar el correo.'));
        this.adding.set(false);
      },
    });
  }

  resend(email: ProfileEmail): void {
    this.emailAction(
      email,
      this.api.resendVerification(email.id),
      `Enviamos un enlace de verificación a ${email.email}.`,
    );
  }

  makePrimary(email: ProfileEmail): void {
    if (!email.isVerified) return;
    this.emailAction(
      email,
      this.api.makePrimary(email.id),
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
      this.api.removeEmail(email.id),
      `Eliminamos ${email.email} de tu perfil.`,
    );
  }

  // ——— Contraseña ———

  changePassword(): void {
    if (this.passwordSaving()) return;
    const mustChange = this.profile()?.mustChangePassword ?? false;
    const errors: { current?: string; rules?: boolean; mismatch?: boolean } = {};
    if (!mustChange && !this.current()) errors.current = 'Ingresa tu contraseña actual.';
    if (!this.rules().every((rule) => rule.ok)) errors.rules = true;
    if (this.password() !== this.confirmation()) errors.mismatch = true;
    this.passwordErrors.set(errors);
    this.passwordDone.set(false);
    if (Object.keys(errors).length) return;

    this.passwordSaving.set(true);
    this.auth.changePassword(this.password(), mustChange ? undefined : this.current()).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordDone.set(true);
        this.current.set('');
        this.password.set('');
        this.confirmation.set('');
        this.toast.show('Tu contraseña se actualizó correctamente.', 3200);
        this.api.get().subscribe((profile) => this.apply(profile));
      },
      error: (error) => {
        this.passwordSaving.set(false);
        this.passwordErrors.set({
          current: apiErrorMessage(error, 'No pudimos cambiar tu contraseña.'),
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
        this.toast.show(apiErrorMessage(error, 'No pudimos completar la acción.'), 4000);
      },
    });
  }

  private apply(profile: Profile): void {
    this.profile.set(profile);
    this.resetForm(profile);
    this.auth.updateIdentity(
      profile.displayName,
      profile.emails.find((email) => email.isPrimary)?.email ?? '',
    );
  }

  private resetForm(profile: Profile): void {
    this.form.set({
      businessName: profile.businessName ?? '',
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
    });
    this.errors.set({});
    this.saveError.set('');
  }
}

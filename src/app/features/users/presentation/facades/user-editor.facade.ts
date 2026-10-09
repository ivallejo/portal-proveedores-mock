import { Injectable, computed, inject, signal } from '@angular/core';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { SelectOption } from '../../../../shared/ui/select/select-option';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { GET_PASSWORD_LINKS, GET_USER, SAVE_USER, SEND_PASSWORD_LINK } from '../../di/users.tokens';
import { PasswordLink } from '../../domain/models/password-link';
import { UserDetail } from '../../domain/models/user-detail';
import { UserEmail } from '../../domain/models/user-email';
import { UserEmailType } from '../../domain/models/user-email-type';
import { UserSummary } from '../../domain/models/user-summary';
import {
  canBePrimaryEmail,
  internalDniError,
  newUserEmailError,
  normalizeUserDocument,
  personNameError,
  providerRucError,
  userAreaError,
} from '../../domain/rules/user-rules';
import { UserEditorTab } from './user-editor-tab';
import { UserForm } from './user-form';
import { UserFormErrors } from './user-form-errors';
import { UserListFacade } from './user-list.facade';

const EMPTY_FORM: UserForm = {
  role: '',
  document: '',
  businessName: '',
  firstName: '',
  lastName: '',
  areaId: '',
  status: 'active',
  mustChangePassword: false,
};
const DATA_FIELDS = [
  'role',
  'document',
  'businessName',
  'firstName',
  'lastName',
  'areaId',
] as const;

/** Panel de alta y edición de un usuario: datos, correos, sociedades y seguridad (enlaces de contraseña). */
@Injectable()
export class UserEditorFacade {
  private readonly getUser = inject(GET_USER);
  private readonly saveUser = inject(SAVE_USER);
  private readonly sendLinkPort = inject(SEND_PASSWORD_LINK);
  private readonly getLinks = inject(GET_PASSWORD_LINKS);
  private readonly list = inject(UserListFacade);
  private readonly toast = inject(ToastService);

  /** `null`: cerrado; `'new'`: alta; o el detalle del usuario en edición. */
  readonly editing = signal<UserDetail | 'new' | null>(null);
  readonly detailLoading = signal(false);
  readonly tab = signal<UserEditorTab>('datos');
  readonly form = signal<UserForm>({ ...EMPTY_FORM });
  readonly emails = signal<UserEmail[]>([]);
  readonly companies = signal<string[]>([]);
  readonly newEmail = signal('');
  readonly newType = signal<UserEmailType>('work');
  readonly emailError = signal('');
  readonly errors = signal<UserFormErrors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);
  readonly links = signal<PasswordLink[]>([]);
  readonly linksLoading = signal(false);
  readonly sendingLink = signal(false);

  readonly isNew = computed(() => this.editing() === 'new');
  readonly detail = computed(() => {
    const editing = this.editing();
    return editing && editing !== 'new' ? editing : null;
  });
  readonly selectedRole = computed(() =>
    this.list.catalog().roles.find((role) => role.code === this.form().role),
  );
  /** Proveedor (RUC y razón social) o personal interno (DNI, nombres y área). */
  readonly isProvider = computed(() => this.selectedRole()?.isProvider ?? false);

  readonly roleOptions = computed<SelectOption[]>(() => {
    const detail = this.detail();
    return this.list
      .catalog()
      .roles.filter((role) => role.isActive || role.code === detail?.role)
      .filter((role) => !detail || role.isProvider === detail.isProvider)
      .map((role) => ({ value: role.code, label: role.name, sub: role.description ?? undefined }));
  });
  readonly areaOptions = computed<SelectOption[]>(() =>
    this.list
      .catalog()
      .areas.filter((area) => area.isActive || area.id === this.detail()?.areaId)
      .map((area) => ({
        value: area.id,
        label: area.name,
        sub: `${area.companyName}${area.isActive ? '' : ' · Inactiva'}`,
      })),
  );
  readonly statusOptions = computed<SelectOption[]>(() => [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    ...(this.detail()?.status === 'locked'
      ? [{ value: 'locked', label: 'Bloqueado', sub: 'Tras varios intentos fallidos' }]
      : []),
  ]);
  readonly companyCards = computed(() =>
    this.list.catalog().companies.map((company) => {
      const on = this.companies().includes(company.code);
      return { ...company, on, disabled: !company.isActive && !on };
    }),
  );
  readonly primaryEmail = computed(
    () => this.emails().find((email) => email.isPrimary)?.email ?? 'el correo principal',
  );
  readonly tabs = computed(() => {
    const errors = this.showErrors() ? this.errors() : {};
    const dataError = DATA_FIELDS.some((key) => !!errors[key]);
    const tabs: { key: UserEditorTab; label: string; count: number; error: boolean }[] = [
      { key: 'datos', label: 'Datos', count: 0, error: dataError },
      { key: 'correos', label: 'Correos', count: this.emails().length, error: !!errors.emails },
      {
        key: 'socs',
        label: 'Sociedades',
        count: this.companies().length,
        error: !!errors.companies,
      },
    ];
    if (!this.isNew()) tabs.push({ key: 'seg', label: 'Seguridad', count: 0, error: false });
    return tabs;
  });
  readonly footerError = computed(() => {
    if (this.saveError()) return this.saveError();
    if (!this.showErrors()) return '';
    const errors = this.errors();
    const fields = Object.keys(errors).filter((key) => key !== 'emails' && key !== 'companies');
    if (fields.length)
      return fields.length === 1
        ? 'Revisa el campo marcado.'
        : `Revisa los ${fields.length} campos marcados.`;
    return errors.emails ?? errors.companies ?? '';
  });

  openNew(): void {
    this.resetDrawer();
    this.form.set({ ...EMPTY_FORM });
    this.emails.set([]);
    this.companies.set([]);
    this.editing.set('new');
  }

  openEdit(row: UserSummary, tab: UserEditorTab = 'datos'): void {
    this.resetDrawer();
    this.tab.set(tab);
    this.detailLoading.set(true);
    this.getUser.execute(row.id).subscribe({
      next: (detail) => {
        this.detailLoading.set(false);
        this.fill(detail);
        this.editing.set(detail);
      },
      error: (error) => {
        this.detailLoading.set(false);
        this.toast.show(userFacingMessage(error, 'No pudimos abrir el usuario.'), 4000);
      },
    });
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  selectTab(tab: UserEditorTab): void {
    this.tab.set(tab);
    const detail = this.detail();
    if (tab === 'seg' && detail) this.loadLinks(detail.id);
  }

  setField<K extends keyof UserForm>(key: K, raw: UserForm[K]): void {
    let value = raw;
    if (key === 'document')
      value = normalizeUserDocument(String(raw), this.isProvider()) as UserForm[K];
    this.form.update((form) => {
      const next = { ...form, [key]: value };
      // Cambiar entre proveedor y personal interno limpia los datos de identidad.
      if (key === 'role') {
        const roles = this.list.catalog().roles;
        const wasProvider = roles.find((role) => role.code === form.role)?.isProvider;
        const isProvider = roles.find((role) => role.code === value)?.isProvider;
        if (form.role && wasProvider !== isProvider)
          Object.assign(next, {
            document: '',
            businessName: '',
            firstName: '',
            lastName: '',
            areaId: '',
          });
      }
      return next;
    });
    this.saveError.set('');
    if (this.showErrors()) this.errors.set(this.validate());
  }

  // Correos

  addEmail(): void {
    const email = this.newEmail().trim().toLowerCase();
    const error = newUserEmailError(email, this.emails());
    if (error) return this.emailError.set(error);
    this.emails.update((emails) => [
      ...emails,
      {
        id: null,
        email,
        type: this.newType(),
        isPrimary: emails.length === 0,
        isVerified: false,
        createdAtUtc: null,
      },
    ]);
    this.newEmail.set('');
    this.emailError.set('');
    if (this.showErrors()) this.errors.set(this.validate());
  }

  makePrimary(target: UserEmail): void {
    this.emails.update((emails) => emails.map((item) => ({ ...item, isPrimary: item === target })));
  }

  removeEmail(target: UserEmail): void {
    if (target.isPrimary) return;
    this.emails.update((emails) => emails.filter((item) => item !== target));
  }

  canBePrimary(email: UserEmail): boolean {
    return canBePrimaryEmail(email, !!this.detail()?.isActivated);
  }

  // Sociedades

  toggleCompany(code: string): void {
    const card = this.companyCards().find((item) => item.code === code);
    if (!card || card.disabled) return;
    this.companies.update((codes) =>
      codes.includes(code) ? codes.filter((item) => item !== code) : [...codes, code],
    );
    if (this.showErrors()) this.errors.set(this.validate());
  }

  // Seguridad

  sendLink(): void {
    const detail = this.detail();
    if (!detail || this.sendingLink()) return;
    this.sendingLink.set(true);
    this.sendLinkPort.execute(detail.id).subscribe({
      next: (sent) => {
        this.sendingLink.set(false);
        this.toast.show(
          `${sent.kind === 'activation' ? 'Enlace de activación' : 'Enlace de recuperación'} enviado a ${sent.email}.`,
          4000,
        );
        this.loadLinks(detail.id);
      },
      error: (error) => {
        this.sendingLink.set(false);
        this.toast.show(userFacingMessage(error, 'No pudimos enviar el enlace.'), 4000);
      },
    });
  }

  // Guardar

  save(): void {
    if (this.saving()) return;
    const errors = this.validate();
    this.errors.set(errors);
    this.showErrors.set(true);
    if (Object.keys(errors).length) {
      // Lleva a la pestaña con el primer problema.
      if (DATA_FIELDS.some((key) => errors[key])) this.tab.set('datos');
      else if (errors.emails) this.tab.set('correos');
      else if (errors.companies) this.tab.set('socs');
      return;
    }
    const detail = this.detail();
    const form = this.form();
    const provider = this.isProvider();
    this.saveError.set('');
    this.saving.set(true);
    this.saveUser
      .execute(detail?.id ?? null, {
        role: form.role,
        document: detail ? undefined : form.document,
        businessName: provider ? form.businessName.trim() : undefined,
        firstName: provider ? undefined : form.firstName.trim(),
        lastName: provider ? undefined : form.lastName.trim(),
        areaId: provider ? null : form.areaId || null,
        companyCodes: this.companies(),
        emails: this.emails().map((email) => ({
          id: email.id ?? undefined,
          email: email.email,
          type: email.type,
          isPrimary: email.isPrimary,
        })),
        status: form.status,
        mustChangePassword: form.mustChangePassword,
      })
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.editing.set(null);
          this.toast.show(
            detail
              ? `${saved.displayName} se actualizó correctamente.`
              : `Creamos a ${saved.displayName}. Enviamos el enlace de activación a ${saved.emails.find((email) => email.isPrimary)?.email}.`,
            4500,
          );
          this.list.load();
        },
        error: (error) => {
          this.saving.set(false);
          this.saveError.set(userFacingMessage(error, 'No pudimos guardar el usuario.'));
        },
      });
  }

  // ——— Internos ———

  private resetDrawer(): void {
    this.tab.set('datos');
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.newEmail.set('');
    this.newType.set('work');
    this.emailError.set('');
    this.links.set([]);
  }

  private fill(detail: UserDetail): void {
    this.form.set({
      role: detail.role ?? '',
      document: detail.document,
      businessName: detail.businessName ?? '',
      firstName: detail.firstName ?? '',
      lastName: detail.lastName ?? '',
      areaId: detail.areaId ?? '',
      status: detail.status,
      mustChangePassword: detail.mustChangePassword,
    });
    this.emails.set(detail.emails.map((email) => ({ ...email })));
    this.companies.set([...detail.companyCodes]);
    if (this.tab() === 'seg') this.loadLinks(detail.id);
  }

  private loadLinks(id: string): void {
    this.linksLoading.set(true);
    this.getLinks.execute(id).subscribe({
      next: (links) => {
        this.links.set(links);
        this.linksLoading.set(false);
      },
      error: () => this.linksLoading.set(false),
    });
  }

  private validate(): UserFormErrors {
    const form = this.form();
    const errors: UserFormErrors = {};
    const isNew = this.isNew();
    const set = (key: keyof UserFormErrors, message: string | undefined) => {
      if (message) errors[key] = message;
    };
    if (!form.role) errors.role = 'Selecciona el rol.';
    else if (this.isProvider()) {
      if (isNew) set('document', providerRucError(form.document));
      if (!form.businessName.trim()) errors.businessName = 'Ingresa la razón social.';
    } else {
      if (isNew) set('document', internalDniError(form.document));
      set('firstName', personNameError(form.firstName, 'Ingresa los nombres.'));
      set('lastName', personNameError(form.lastName, 'Ingresa los apellidos.'));
      const area = this.list.catalog().areas.find((item) => item.id === form.areaId);
      set('areaId', userAreaError(form.areaId, form.role, area, this.companies()));
    }
    if (!this.emails().length) errors.emails = 'Agrega al menos un correo en la pestaña Correos.';
    if (!this.companies().length)
      errors.companies = 'Asigna al menos una sociedad en la pestaña Sociedades.';
    return errors;
  }
}

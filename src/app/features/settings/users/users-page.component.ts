import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../../core/layout/page-loading.service';
import { apiErrorMessage } from '../../../shared/utils/api-errors';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/ui/dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import {
  CalloutComponent,
  EmptyStateComponent,
} from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import {
  KpiCardComponent,
  PageHeaderComponent,
  PaginationComponent,
} from '../../../shared/ui/page/page.components';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Tone } from '../../../shared/ui/tone';
import { initials } from '../../../shared/utils/format';
import { EMAIL_TYPES } from '../../profile/profile-page.component';
import { EmailType } from '../../profile/profile.service';
import {
  PasswordLink,
  UserCatalog,
  UserDetail,
  UserEmail,
  UserFilter,
  UserStatus,
  UserSummary,
  UsersService,
} from './users.service';

const PAGE_SIZE = 10;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PERSON_NAME = /^[\p{L}' .-]+$/u;

type Tab = 'datos' | 'correos' | 'socs' | 'seg';
type Field = 'role' | 'document' | 'businessName' | 'firstName' | 'lastName' | 'areaId';
type Errors = Partial<Record<Field | 'emails' | 'companies', string>>;

interface UserForm {
  role: string;
  document: string;
  businessName: string;
  firstName: string;
  lastName: string;
  areaId: string;
  status: UserStatus;
  mustChangePassword: boolean;
}

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

const ROLE_TONES: Record<string, Tone> = {
  ADMINISTRATOR: 'purple',
  PROVIDER: 'info',
  AREA_APPROVER: 'teal',
  ACCOUNTS_PAYABLE: 'orange',
  INTERNAL_USER: 'gray',
};

export const STATUS_LABELS: Record<UserStatus, { label: string; tone: Tone }> = {
  active: { label: 'Activo', tone: 'success' },
  inactive: { label: 'Inactivo', tone: 'gray' },
  locked: { label: 'Bloqueado', tone: 'danger' },
};

const LINK_STATUS: Record<PasswordLink['status'], { label: string; tone: Tone }> = {
  valid: { label: 'Vigente', tone: 'info' },
  used: { label: 'Usado', tone: 'success' },
  replaced: { label: 'Reemplazado', tone: 'gray' },
  expired: { label: 'Expirado', tone: 'gray' },
};

/** «dd/mm/aaaa hh:mm» en hora local. */
function stamp(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Configuración › Usuarios: proveedores y personal interno, su rol, correos, sociedades y seguridad. */
@Component({
  selector: 'app-users-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    BadgeComponent,
    IconComponent,
    SpinnerComponent,
    EmptyStateComponent,
    CalloutComponent,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-page.component.html',
})
export class UsersPageComponent {
  private readonly api = inject(UsersService);
  private readonly toast = inject(ToastService);

  readonly pageSize = PAGE_SIZE;
  readonly emailTypes = EMAIL_TYPES;
  readonly statusLabels = STATUS_LABELS;
  readonly linkStatus = LINK_STATUS;
  readonly stamp = stamp;
  readonly initials = initials;

  readonly statusFilterOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'locked', label: 'Bloqueados' },
  ];

  // ——— Listado ———
  readonly catalog = signal<UserCatalog>({ roles: [], areas: [], companies: [] });
  readonly rows = signal<UserSummary[]>([]);
  readonly total = signal(0);
  readonly counts = signal<{ total: number; active: number; blockedOrInactive: number } | null>(
    null,
  );
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal<UserFilter>({ search: '', role: '', status: '' });
  readonly applied = signal<UserFilter>({ search: '', role: '', status: '' });
  readonly page = signal(1);

  readonly roleFilterOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Todos los roles' },
    ...this.catalog().roles.map((role) => ({ value: role.code, label: role.name })),
  ]);

  readonly kpis = computed(() => {
    const counts = this.counts();
    return {
      total: counts ? String(counts.total) : '—',
      active: counts ? String(counts.active) : '—',
      other: counts ? String(counts.blockedOrInactive) : '—',
    };
  });

  // ——— Panel ———
  /** `null`: cerrado; `'new'`: alta; o el detalle del usuario en edición. */
  readonly editing = signal<UserDetail | 'new' | null>(null);
  readonly detailLoading = signal(false);
  readonly tab = signal<Tab>('datos');
  readonly form = signal<UserForm>({ ...EMPTY_FORM });
  readonly emails = signal<UserEmail[]>([]);
  readonly companies = signal<string[]>([]);
  readonly newEmail = signal('');
  readonly newType = signal<EmailType>('work');
  readonly emailError = signal('');
  readonly errors = signal<Errors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);
  readonly links = signal<PasswordLink[]>([]);
  readonly linksLoading = signal(false);
  readonly sendingLink = signal(false);

  readonly confirming = signal<UserSummary | null>(null);
  readonly toggling = signal(false);

  readonly isNew = computed(() => this.editing() === 'new');
  readonly detail = computed(() => {
    const editing = this.editing();
    return editing && editing !== 'new' ? editing : null;
  });

  readonly selectedRole = computed(() =>
    this.catalog().roles.find((role) => role.code === this.form().role),
  );
  /** Proveedor (RUC y razón social) o personal interno (DNI, nombres y área). */
  readonly isProvider = computed(() => this.selectedRole()?.isProvider ?? false);

  readonly roleOptions = computed<SelectOption[]>(() => {
    const detail = this.detail();
    return this.catalog()
      .roles.filter((role) => role.isActive || role.code === detail?.role)
      .filter((role) => !detail || role.isProvider === detail.isProvider)
      .map((role) => ({ value: role.code, label: role.name, sub: role.description ?? undefined }));
  });

  readonly areaOptions = computed<SelectOption[]>(() =>
    this.catalog()
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
    this.catalog().companies.map((company) => {
      const on = this.companies().includes(company.code);
      return { ...company, on, disabled: !company.isActive && !on };
    }),
  );

  readonly primaryEmail = computed(
    () => this.emails().find((email) => email.isPrimary)?.email ?? 'el correo principal',
  );

  readonly tabs = computed(() => {
    const errors = this.showErrors() ? this.errors() : {};
    const dataError = (
      ['role', 'document', 'businessName', 'firstName', 'lastName', 'areaId'] as const
    ).some((key) => !!errors[key]);
    const tabs: { key: Tab; label: string; count: number; error: boolean }[] = [
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

  constructor() {
    inject(PageLoadingService).bind(
      computed(() => this.loading() || this.saving() || this.sendingLink()),
      'Cargando usuarios',
    );
    this.api.catalog().subscribe({ next: (catalog) => this.catalog.set(catalog) });
    this.load();
  }

  roleTone(code: string | null): Tone {
    return (code && ROLE_TONES[code]) || 'gray';
  }

  roleName(code: string | null): string {
    return this.catalog().roles.find((role) => role.code === code)?.name ?? '—';
  }

  emailTypeLabel(type: EmailType): string {
    return EMAIL_TYPES.find((item) => item.value === type)?.label ?? type;
  }

  // ——— Listado ———

  load(): void {
    this.loading.set(true);
    this.api.search(this.applied(), this.page(), PAGE_SIZE).subscribe({
      next: (result) => {
        this.rows.set(result.items);
        this.total.set(result.total);
        this.counts.set(result.counts);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(apiErrorMessage(error, 'No pudimos cargar los usuarios.'));
      },
    });
  }

  setDraft(changes: Partial<UserFilter>): void {
    this.draft.update((draft) => ({ ...draft, ...changes }));
  }

  search(): void {
    this.applied.set({ ...this.draft() });
    this.page.set(1);
    this.load();
  }

  clear(): void {
    this.draft.set({ search: '', role: '', status: '' });
    this.search();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  // ——— Panel ———

  openNew(): void {
    this.resetDrawer();
    this.form.set({ ...EMPTY_FORM });
    this.emails.set([]);
    this.companies.set([]);
    this.editing.set('new');
  }

  openEdit(row: UserSummary, tab: Tab = 'datos'): void {
    this.resetDrawer();
    this.tab.set(tab);
    this.detailLoading.set(true);
    this.api.get(row.id).subscribe({
      next: (detail) => {
        this.detailLoading.set(false);
        this.fill(detail);
        this.editing.set(detail);
      },
      error: (error) => {
        this.detailLoading.set(false);
        this.toast.show(apiErrorMessage(error, 'No pudimos abrir el usuario.'), 4000);
      },
    });
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  selectTab(tab: Tab): void {
    this.tab.set(tab);
    const detail = this.detail();
    if (tab === 'seg' && detail) this.loadLinks(detail.id);
  }

  setField<K extends keyof UserForm>(key: K, raw: UserForm[K]): void {
    let value = raw;
    if (key === 'document') {
      const digits = String(raw).replace(/\D/g, '');
      value = digits.slice(0, this.isProvider() ? 11 : 8) as UserForm[K];
    }
    this.form.update((form) => {
      const next = { ...form, [key]: value };
      // Cambiar entre proveedor y personal interno limpia los datos de identidad.
      if (key === 'role') {
        const wasProvider = this.catalog().roles.find(
          (role) => role.code === form.role,
        )?.isProvider;
        const isProvider = this.catalog().roles.find((role) => role.code === value)?.isProvider;
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
    if (!EMAIL.test(email))
      return this.emailError.set('Ingresa un correo válido, por ejemplo nombre@empresa.com.');
    if (this.emails().some((item) => item.email === email))
      return this.emailError.set('Este correo ya está registrado para el usuario.');
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

  /** Un correo nuevo de una cuenta activada se verifica antes de poder ser principal. */
  canBePrimary(email: UserEmail): boolean {
    return email.isVerified || !this.detail()?.isActivated;
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
    this.api.sendPasswordLink(detail.id).subscribe({
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
        this.toast.show(apiErrorMessage(error, 'No pudimos enviar el enlace.'), 4000);
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
      if (
        errors.role ||
        errors.document ||
        errors.businessName ||
        errors.firstName ||
        errors.lastName ||
        errors.areaId
      )
        this.tab.set('datos');
      else if (errors.emails) this.tab.set('correos');
      else if (errors.companies) this.tab.set('socs');
      return;
    }
    const detail = this.detail();
    const form = this.form();
    const provider = this.isProvider();
    this.saveError.set('');
    this.saving.set(true);
    this.api
      .save(detail?.id ?? null, {
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
          this.load();
        },
        error: (error) => {
          this.saving.set(false);
          this.saveError.set(apiErrorMessage(error, 'No pudimos guardar el usuario.'));
        },
      });
  }

  // ——— Activar / desactivar / desbloquear ———

  askToggle(row: UserSummary): void {
    this.confirming.set(row);
  }

  toggleVerb(row: UserSummary): string {
    return row.status === 'active'
      ? 'Desactivar'
      : row.status === 'locked'
        ? 'Desbloquear'
        : 'Activar';
  }

  confirmText(row: UserSummary): string {
    if (row.status === 'active')
      return `${row.displayName} no podrá iniciar sesión en el portal. Sus documentos y su historial se conservan.`;
    return `${row.displayName} volverá a estar disponible en el portal${row.status === 'locked' ? ' y podrá iniciar sesión nuevamente.' : '.'}`;
  }

  toggle(): void {
    const row = this.confirming();
    if (!row || this.toggling()) return;
    this.toggling.set(true);
    const activate = row.status !== 'active';
    this.api.setStatus(row.id, activate).subscribe({
      next: (saved) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(
          `${saved.displayName} ${activate ? 'está activo nuevamente.' : 'quedó inactivo.'}`,
        );
        this.load();
      },
      error: (error) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(apiErrorMessage(error, 'No pudimos cambiar el estado.'), 4000);
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
    this.api.passwordLinks(id).subscribe({
      next: (links) => {
        this.links.set(links);
        this.linksLoading.set(false);
      },
      error: () => this.linksLoading.set(false),
    });
  }

  private validate(): Errors {
    const form = this.form();
    const errors: Errors = {};
    const isNew = this.isNew();
    if (!form.role) errors.role = 'Selecciona el rol.';
    else if (this.isProvider()) {
      if (isNew && !/^\d{11}$/.test(form.document))
        errors.document = 'El RUC debe tener 11 dígitos.';
      else if (isNew && !/^(10|20)/.test(form.document))
        errors.document = 'El RUC debe empezar con 10 o 20.';
      if (!form.businessName.trim()) errors.businessName = 'Ingresa la razón social.';
    } else {
      if (isNew && !/^\d{8}$/.test(form.document)) errors.document = 'El DNI debe tener 8 dígitos.';
      if (!form.firstName.trim()) errors.firstName = 'Ingresa los nombres.';
      else if (!PERSON_NAME.test(form.firstName.trim())) errors.firstName = 'Usa solo letras.';
      if (!form.lastName.trim()) errors.lastName = 'Ingresa los apellidos.';
      else if (!PERSON_NAME.test(form.lastName.trim())) errors.lastName = 'Usa solo letras.';
      if (!form.areaId && form.role !== 'ADMINISTRATOR') errors.areaId = 'Selecciona el área.';
      const area = this.catalog().areas.find((item) => item.id === form.areaId);
      if (area && !this.companies().includes(area.companyCode) && this.companies().length)
        errors.areaId = `El área es de ${area.companyName}: asígnale también esa sociedad.`;
    }
    if (!this.emails().length) errors.emails = 'Agrega al menos un correo en la pestaña Correos.';
    if (!this.companies().length)
      errors.companies = 'Asigna al menos una sociedad en la pestaña Sociedades.';
    return errors;
  }
}

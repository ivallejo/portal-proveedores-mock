import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../../../../shared/documents/documents.service';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { DialogComponent } from '../../../../shared/ui/dialog/dialog.component';
import {
  CalloutComponent,
  EmptyStateComponent,
} from '../../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import {
  PageHeaderComponent,
  PaginationComponent,
} from '../../../../shared/ui/page/page.components';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminCatalog, AdminService, AdminUser, RoleCode } from '../services/admin.service';

interface UserForm {
  username: string;
  email: string;
  name: string;
  ruc: string;
  password: string;
  roles: RoleCode[];
  areaId: string;
  companyCodes: string[];
}

const EMPTY_FORM: UserForm = {
  username: '',
  email: '',
  name: '',
  ruc: '',
  password: '',
  roles: ['INTERNAL_USER'],
  areaId: '',
  companyCodes: [],
};

const PASSWORD_RULE = /^(?=.*[a-záéíóúñ])(?=.*[A-ZÁÉÍÓÚÑ])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-admin-users',
  imports: [
    FormsModule,
    PageHeaderComponent,
    PaginationComponent,
    BadgeComponent,
    DialogComponent,
    CalloutComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent {
  private readonly admin = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly pageSize = 10;
  readonly users = signal<AdminUser[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly search = signal('');
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly catalog = signal<AdminCatalog>({ roles: [], areas: [], companies: [] });

  /** `null`: sin diálogo; `'new'`: crear; un usuario: editarlo. */
  readonly editing = signal<AdminUser | 'new' | null>(null);
  readonly form = signal<UserForm>({ ...EMPTY_FORM });
  readonly formError = signal('');
  readonly saving = signal(false);
  readonly showPassword = signal(false);
  /** Usuario con una acción en curso (estado o desbloqueo). */
  readonly busyId = signal('');

  readonly isNew = computed(() => this.editing() === 'new');
  readonly needsArea = computed(() => this.form().roles.includes('AREA_APPROVER'));
  readonly isAdminForm = computed(() => this.form().roles.includes('ADMINISTRATOR'));

  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.admin.catalog().subscribe({
      next: (catalog) => this.catalog.set(catalog),
      error: (error) => this.loadError.set(apiErrorMessage(error)),
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.searchTimer));
  }

  load(): void {
    this.loading.set(true);
    this.admin.search(this.search(), this.page(), this.pageSize).subscribe({
      next: (result) => {
        this.users.set(result.items);
        this.total.set(result.total);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(apiErrorMessage(error, 'No fue posible cargar los usuarios.'));
      },
    });
  }

  setSearch(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.goTo(1), 300);
  }

  clearSearch(): void {
    this.search.set('');
    this.goTo(1);
  }

  goTo(page: number): void {
    this.page.set(page);
    this.load();
  }

  roleName(code: string): string {
    return this.catalog().roles.find((role) => role.code === code)?.name ?? code;
  }

  companyName(code: string): string {
    return this.catalog().companies.find((company) => company.code === code)?.name ?? code;
  }

  /** «Todas» si tiene todas las sociedades; si no, sus nombres. */
  companiesLabel(user: AdminUser): string {
    const all = this.catalog().companies;
    if (user.roles.includes('ADMINISTRATOR')) return 'Todas';
    if (all.length && user.companyCodes.length === all.length) return 'Todas';
    return user.companyCodes.map((code) => this.companyName(code)).join(', ') || '—';
  }

  // ——— Formulario ———

  openNew(): void {
    this.form.set({
      ...EMPTY_FORM,
      companyCodes: this.catalog().companies.map((company) => company.code),
    });
    this.openDialog('new');
  }

  openEdit(user: AdminUser): void {
    this.form.set({
      username: user.username,
      email: user.email,
      name: user.name,
      ruc: user.ruc ?? '',
      password: '',
      roles: [...user.roles],
      areaId: user.areaId ?? '',
      companyCodes: [...user.companyCodes],
    });
    this.openDialog(user);
  }

  closeDialog(): void {
    this.editing.set(null);
  }

  patch(changes: Partial<UserForm>): void {
    this.form.update((form) => ({ ...form, ...changes }));
  }

  toggleRole(code: RoleCode): void {
    const roles = this.form().roles;
    this.patch({
      roles: roles.includes(code) ? roles.filter((item) => item !== code) : [...roles, code],
    });
  }

  toggleCompany(code: string): void {
    const codes = this.form().companyCodes;
    this.patch({
      companyCodes: codes.includes(code) ? codes.filter((item) => item !== code) : [...codes, code],
    });
  }

  save(): void {
    const form = this.form();
    const problem = this.validate(form);
    if (problem) return this.formError.set(problem);
    this.formError.set('');
    this.saving.set(true);

    const access = {
      email: form.email.trim(),
      name: form.name.trim(),
      roles: form.roles,
      areaId: form.areaId || null,
      companyCodes: form.companyCodes,
    };
    const editing = this.editing();
    const request =
      editing === 'new'
        ? this.admin.create({
            ...access,
            username: form.username.trim(),
            ruc: form.ruc.trim() || null,
            password: form.password,
          })
        : this.admin.update((editing as AdminUser).id, access);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
        this.toast.show(editing === 'new' ? 'Usuario creado correctamente' : 'Usuario actualizado');
        this.load();
      },
      error: (error) => {
        this.saving.set(false);
        this.formError.set(apiErrorMessage(error, 'No fue posible guardar el usuario.'));
      },
    });
  }

  // ——— Acciones de la tabla ———

  isSelf(user: AdminUser): boolean {
    return user.username === this.auth.user()?.username;
  }

  toggleStatus(user: AdminUser): void {
    this.runAction(user, this.admin.setStatus(user.id, !user.isActive), (updated) =>
      updated.isActive ? 'Usuario activado' : 'Usuario desactivado',
    );
  }

  unlock(user: AdminUser): void {
    this.runAction(user, this.admin.unlock(user.id), () => 'Cuenta desbloqueada');
  }

  private runAction(
    user: AdminUser,
    request: ReturnType<AdminService['unlock']>,
    message: (updated: AdminUser) => string,
  ): void {
    this.busyId.set(user.id);
    request.subscribe({
      next: (updated) => {
        this.busyId.set('');
        this.users.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.toast.show(message(updated));
      },
      error: (error) => {
        this.busyId.set('');
        this.toast.show(apiErrorMessage(error, 'No fue posible completar la acción.'));
      },
    });
  }

  private openDialog(target: AdminUser | 'new'): void {
    this.formError.set('');
    this.showPassword.set(false);
    this.editing.set(target);
  }

  /** Las mismas reglas que valida el backend, para avisar antes de enviar. */
  private validate(form: UserForm): string {
    if (this.isNew() && !form.username.trim()) return 'Ingresa el nombre de usuario.';
    if (!form.name.trim()) return 'Ingresa el nombre o la razón social.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Ingresa un correo electrónico válido.';
    if (!form.roles.length) return 'Asigna al menos un rol.';
    if (form.roles.includes('PROVIDER') && !/^\d{11}$/.test(form.ruc.trim()))
      return 'El proveedor necesita un RUC de 11 dígitos.';
    if (this.isNew() && form.ruc.trim() && !/^\d{11}$/.test(form.ruc.trim()))
      return 'El RUC debe tener 11 dígitos.';
    if (form.roles.includes('AREA_APPROVER') && !form.areaId)
      return 'El aprobador de área necesita un área.';
    if (!form.companyCodes.length && !form.roles.includes('ADMINISTRATOR'))
      return 'Asigna al menos una sociedad.';
    if (this.isNew() && !PASSWORD_RULE.test(form.password))
      return 'La contraseña temporal debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.';
    return '';
  }
}

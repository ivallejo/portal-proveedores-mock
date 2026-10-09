import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SessionMenuFacade } from '../../../menus';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { StatusFilter } from '../../../../shared/utils/status-filter';
import { matchesStatus, statusOptions } from '../../../../shared/utils/status-filter.util';
import { includesTerm } from '../../../../shared/utils/text-search.util';
import {
  CHANGE_ROLE_STATUS,
  GET_PERMISSION_OPTIONS,
  GET_ROLES,
  SAVE_ROLE,
} from '../../di/roles.tokens';
import { AccessRole } from '../../domain/models/access-role';
import { PermissionOption } from '../../domain/models/permission-option';
import {
  permissionTree,
  roleNameError,
  togglePermission,
} from '../../domain/rules/permission-rules';
import { RoleForm } from './role-form';
import { RoleFormErrors } from './role-form-errors';

const PAGE_SIZE = 10;
const EMPTY_FORM: RoleForm = { name: '', description: '', isActive: true };

/** Estado de Configuración › Roles y permisos: listado, panel con el árbol de permisos y activación. */
@Injectable()
export class RoleListFacade {
  private readonly getRoles = inject(GET_ROLES);
  private readonly getPermissionOptions = inject(GET_PERMISSION_OPTIONS);
  private readonly saveRole = inject(SAVE_ROLE);
  private readonly changeStatus = inject(CHANGE_ROLE_STATUS);
  private readonly sessionMenu = inject(SessionMenuFacade);
  private readonly toast = inject(ToastService);

  readonly statusOptions = statusOptions(false);
  readonly pageSize = PAGE_SIZE;

  readonly roles = signal<AccessRole[]>([]);
  readonly menus = signal<PermissionOption[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal({ search: '', status: '' as StatusFilter });
  readonly applied = signal({ search: '', status: '' as StatusFilter });
  readonly page = signal(1);

  /** `null`: cerrado; `'new'`: nuevo; o el rol en edición. */
  readonly editing = signal<AccessRole | 'new' | null>(null);
  readonly form = signal<RoleForm>(EMPTY_FORM);
  readonly selected = signal<ReadonlySet<string>>(new Set());
  readonly errors = signal<RoleFormErrors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<AccessRole | null>(null);
  readonly toggling = signal(false);

  readonly rows = computed(() => {
    const { search, status } = this.applied();
    return this.roles().filter(
      (role) =>
        matchesStatus(role.isActive, status) &&
        includesTerm(search, role.name, role.description, role.code),
    );
  });
  readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => ({
    total: String(this.roles().length),
    active: String(this.roles().filter((role) => role.isActive).length),
    menus: String(this.menus().length),
  }));
  readonly isNew = computed(() => this.editing() === 'new');
  readonly current = computed(() => {
    const editing = this.editing();
    return editing && editing !== 'new' ? editing : null;
  });

  readonly tree = computed(() => permissionTree(this.menus(), this.selected()));
  readonly selectedCount = computed(
    () => this.menus().filter((menu) => this.selected().has(menu.id)).length,
  );

  load(): void {
    this.loading.set(true);
    forkJoin({
      roles: this.getRoles.execute(),
      menus: this.getPermissionOptions.execute(),
    }).subscribe({
      next: ({ roles, menus }) => {
        this.roles.set(roles);
        this.menus.set(menus);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(userFacingMessage(error, 'No pudimos cargar los roles.'));
      },
    });
  }

  setDraft(changes: Partial<{ search: string; status: StatusFilter }>): void {
    this.draft.update((draft) => ({ ...draft, ...changes }));
  }

  search(): void {
    this.applied.set({ ...this.draft() });
    this.page.set(1);
  }

  clear(): void {
    this.draft.set({ search: '', status: '' });
    this.search();
  }

  // ——— Panel ———

  openNew(): void {
    this.form.set(EMPTY_FORM);
    this.selected.set(new Set());
    this.openDrawer('new');
  }

  openEdit(role: AccessRole): void {
    this.form.set({
      name: role.name,
      description: role.description ?? '',
      isActive: role.isActive,
    });
    this.selected.set(new Set(role.menuIds));
    this.openDrawer(role);
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  setField(key: 'name' | 'description', value: string): void {
    this.form.update((form) => ({ ...form, [key]: value }));
    if (this.showErrors()) this.errors.set(this.validate());
  }

  setActive(isActive: boolean): void {
    this.form.update((form) => ({ ...form, isActive }));
  }

  toggle(menu: PermissionOption): void {
    this.selected.set(togglePermission(this.selected(), menu, this.menus()));
    if (this.showErrors()) this.errors.set(this.validate());
  }

  selectAll(): void {
    this.selected.set(new Set(this.menus().map((menu) => menu.id)));
    if (this.showErrors()) this.errors.set(this.validate());
  }

  selectNone(): void {
    this.selected.set(new Set());
  }

  save(): void {
    if (this.saving()) return;
    const errors = this.validate();
    this.errors.set(errors);
    this.showErrors.set(true);
    if (Object.keys(errors).length) return;
    const role = this.current();
    const form = this.form();
    this.saveError.set('');
    this.saving.set(true);
    this.saveRole
      .execute(
        role?.id ?? null,
        {
          name: form.name.trim(),
          description: form.description.trim(),
          menuIds: [...this.selected()],
        },
        form.isActive,
      )
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.editing.set(null);
          this.toast.show(role ? `Rol ${saved.name} actualizado.` : `Rol ${saved.name} creado.`);
          // Si se cambió el propio rol, el menú lateral se actualiza.
          this.sessionMenu.refresh();
          this.load();
        },
        error: (error) => {
          this.saving.set(false);
          this.saveError.set(userFacingMessage(error, 'No pudimos guardar el rol.'));
        },
      });
  }

  // ——— Activar / desactivar ———

  confirmText(role: AccessRole): string {
    return role.isActive
      ? `Los ${role.userCount} usuarios con el rol ${role.name} perderán acceso a sus opciones de menú hasta que se reactive.`
      : `${role.name} volverá a estar disponible en el portal.`;
  }

  toggleStatus(): void {
    const role = this.confirming();
    if (!role || this.toggling()) return;
    this.toggling.set(true);
    this.changeStatus.execute(role.id, !role.isActive).subscribe({
      next: (saved) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(
          `${saved.name} ${saved.isActive ? 'está activo nuevamente.' : 'quedó inactivo.'}`,
        );
        this.sessionMenu.refresh();
        this.load();
      },
      error: (error) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(userFacingMessage(error, 'No pudimos cambiar el estado.'), 4000);
      },
    });
  }

  private openDrawer(target: AccessRole | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  private validate(): RoleFormErrors {
    const errors: RoleFormErrors = {};
    const name = roleNameError(this.form().name.trim(), this.roles(), this.current()?.id ?? null);
    if (name) errors.name = name;
    if (!this.selected().size) errors.menus = 'Selecciona al menos una opción del menú.';
    return errors;
  }
}

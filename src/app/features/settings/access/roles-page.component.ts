import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MenuService } from '../../../core/layout/menu.service';
import { PageLoadingService } from '../../../core/layout/page-loading.service';
import { apiErrorMessage } from '../../../shared/documents/documents.service';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/ui/dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import {
  CalloutComponent,
  EmptyStateComponent,
} from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ICONS, IconName } from '../../../shared/ui/icon/icons';
import {
  KpiCardComponent,
  PageHeaderComponent,
  PaginationComponent,
} from '../../../shared/ui/page/page.components';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Tone } from '../../../shared/ui/tone';
import { StatusFilter, includesTerm, matchesStatus, statusOptions } from '../organization/status';
import { AccessService, MenuItem, RoleItem } from './access.service';

const PAGE_SIZE = 10;

const ROLE_TONES: Record<string, Tone> = {
  ADMINISTRATOR: 'purple',
  PROVIDER: 'info',
  AREA_APPROVER: 'teal',
  ACCOUNTS_PAYABLE: 'orange',
};

/** Configuración › Roles y permisos: qué opciones del menú ve (y usa) cada rol. */
@Component({
  selector: 'app-roles-page',
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
  templateUrl: './roles-page.component.html',
})
export class RolesPageComponent {
  private readonly api = inject(AccessService);
  private readonly toast = inject(ToastService);
  private readonly menu = inject(MenuService);

  readonly statusOptions = statusOptions(false);
  readonly pageSize = PAGE_SIZE;

  readonly roles = signal<RoleItem[]>([]);
  readonly menus = signal<MenuItem[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal({ search: '', status: '' as StatusFilter });
  readonly applied = signal({ search: '', status: '' as StatusFilter });
  readonly page = signal(1);

  /** `null`: cerrado; `'new'`: nuevo; o el rol en edición. */
  readonly editing = signal<RoleItem | 'new' | null>(null);
  readonly form = signal({ name: '', description: '', isActive: true });
  readonly selected = signal<ReadonlySet<string>>(new Set());
  readonly errors = signal<{ name?: string; menus?: string }>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<RoleItem | null>(null);
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

  /** Árbol de permisos: menús principales y sus submenús, con su estado de selección. */
  readonly tree = computed(() => {
    const selected = this.selected();
    const menus = this.menus();
    return menus.map((menu) => {
      const children = menus.filter((child) => child.parentId === menu.id);
      const chosen = children.filter((child) => selected.has(child.id)).length;
      const on = children.length ? chosen === children.length : selected.has(menu.id);
      const mixed = children.length > 0 && chosen > 0 && chosen < children.length;
      return { menu, on, mixed, isChild: menu.parentId !== null };
    });
  });
  readonly selectedCount = computed(
    () => this.menus().filter((menu) => this.selected().has(menu.id)).length,
  );

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Cargando roles');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({ roles: this.api.roles(), menus: this.api.menus() }).subscribe({
      next: ({ roles, menus }) => {
        this.roles.set(roles);
        this.menus.set(menus);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(apiErrorMessage(error, 'No pudimos cargar los roles.'));
      },
    });
  }

  roleTone(role: RoleItem): Tone {
    return ROLE_TONES[role.code] ?? 'gray';
  }

  icon(name: string): IconName {
    return name in ICONS ? (name as IconName) : 'circle';
  }

  menuSummary(role: RoleItem): { count: string; caption: string } {
    const total = this.menus().length;
    const count = role.menuIds.filter((id) => this.menus().some((menu) => menu.id === id)).length;
    return {
      count: `${count} de ${total}`,
      caption: count === total ? 'Acceso total' : 'opciones del menú',
    };
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
    this.form.set({ name: '', description: '', isActive: true });
    this.selected.set(new Set());
    this.openDrawer('new');
  }

  openEdit(role: RoleItem): void {
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

  /** Un menú principal marca o desmarca todos sus submenús; un submenú arrastra a su menú principal. */
  toggle(menu: MenuItem): void {
    const menus = this.menus();
    const children = menus.filter((child) => child.parentId === menu.id);
    const next = new Set(this.selected());
    if (children.length) {
      const all = children.every((child) => next.has(child.id));
      for (const id of [menu.id, ...children.map((child) => child.id)]) {
        if (all) next.delete(id);
        else next.add(id);
      }
    } else {
      if (!next.delete(menu.id)) next.add(menu.id);
      if (menu.parentId) {
        const siblings = menus.filter((child) => child.parentId === menu.parentId);
        if (siblings.some((child) => next.has(child.id))) next.add(menu.parentId);
        else next.delete(menu.parentId);
      }
    }
    this.selected.set(next);
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
    const editing = this.editing();
    const role = editing && editing !== 'new' ? editing : null;
    const form = this.form();
    this.saveError.set('');
    this.saving.set(true);
    this.api
      .saveRole(role?.id ?? null, {
        name: form.name.trim(),
        description: form.description.trim(),
        menuIds: [...this.selected()],
      })
      .subscribe({
        next: (saved) => {
          // El estado se guarda aparte (activar / desactivar).
          if (saved.isActive !== form.isActive) {
            this.api.setRoleStatus(saved.id, form.isActive).subscribe({
              next: () => this.saved(saved, !role),
              error: (error) => this.failed(error),
            });
          } else this.saved(saved, !role);
        },
        error: (error) => this.failed(error),
      });
  }

  // ——— Activar / desactivar ———

  confirmText(role: RoleItem): string {
    return role.isActive
      ? `Los ${role.userCount} usuarios con el rol ${role.name} perderán acceso a sus opciones de menú hasta que se reactive.`
      : `${role.name} volverá a estar disponible en el portal.`;
  }

  toggleStatus(): void {
    const role = this.confirming();
    if (!role || this.toggling()) return;
    this.toggling.set(true);
    this.api.setRoleStatus(role.id, !role.isActive).subscribe({
      next: (saved) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(
          `${saved.name} ${saved.isActive ? 'está activo nuevamente.' : 'quedó inactivo.'}`,
        );
        this.menu.refresh();
        this.load();
      },
      error: (error) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(apiErrorMessage(error, 'No pudimos cambiar el estado.'), 4000);
      },
    });
  }

  private saved(role: RoleItem, created: boolean): void {
    this.saving.set(false);
    this.editing.set(null);
    this.toast.show(created ? `Rol ${role.name} creado.` : `Rol ${role.name} actualizado.`);
    // Si se cambió el propio rol, el menú lateral se actualiza.
    this.menu.refresh();
    this.load();
  }

  private failed(error: unknown): void {
    this.saving.set(false);
    this.saveError.set(apiErrorMessage(error, 'No pudimos guardar el rol.'));
  }

  private openDrawer(target: RoleItem | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  private validate(): { name?: string; menus?: string } {
    const errors: { name?: string; menus?: string } = {};
    const name = this.form().name.trim();
    const editing = this.editing();
    if (!name) errors.name = 'Ingresa el nombre del rol.';
    else if (
      this.roles().some(
        (role) =>
          role.name.toLowerCase() === name.toLowerCase() &&
          (editing === 'new' || role.id !== editing?.id),
      )
    )
      errors.name = 'Ya existe un rol con ese nombre.';
    if (!this.selected().size) errors.menus = 'Selecciona al menos una opción del menú.';
    return errors;
  }
}

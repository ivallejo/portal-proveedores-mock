import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MenuService } from '../../../core/layout/menu.service';
import { PageLoadingService } from '../../../core/layout/page-loading.service';
import { apiErrorMessage } from '../../../core/http/api-error-message';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/ui/dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import {
  CalloutComponent,
  EmptyStateComponent,
} from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ICONS, IconName } from '../../../shared/ui/icon/icons';
import { KpiCardComponent, PageHeaderComponent } from '../../../shared/ui/page/page.components';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { StatusFilter, includesTerm, matchesStatus, statusOptions } from '../organization/status';
import { AccessService, MENU_ICONS, MenuItem } from './access.service';

type Field = 'name' | 'route' | 'icon' | 'order' | 'parentId';

/** Opciones que no se pueden desactivar: sin ellas nadie podría administrar roles y menús. */
const PROTECTED = new Set(['SETTINGS', 'SETTINGS_ROLES', 'SETTINGS_MENUS']);

/** Configuración › Menús: opciones del menú lateral en dos niveles, con su ruta, ícono y orden. */
@Component({
  selector: 'app-menus-page',
  imports: [
    PageHeaderComponent,
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
  templateUrl: './menus-page.component.html',
})
export class MenusPageComponent {
  private readonly api = inject(AccessService);
  private readonly toast = inject(ToastService);
  private readonly menu = inject(MenuService);

  readonly statusOptions = statusOptions(false);
  readonly iconOptions: SelectOption[] = MENU_ICONS.map((icon) => ({
    value: icon.value,
    label: icon.label,
    sub: icon.value,
  }));

  readonly menus = signal<MenuItem[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal({ search: '', status: '' as StatusFilter });
  readonly applied = signal({ search: '', status: '' as StatusFilter });

  readonly editing = signal<MenuItem | 'new' | null>(null);
  readonly form = signal({
    name: '',
    route: '',
    icon: '',
    order: '1',
    parentId: '',
    isActive: true,
  });
  readonly errors = signal<Partial<Record<Field, string>>>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<MenuItem | null>(null);
  readonly toggling = signal(false);

  /** Un menú principal se muestra si coincide él o alguno de sus submenús. */
  readonly rows = computed(() => {
    const { search, status } = this.applied();
    const all = this.menus();
    const match = (menu: MenuItem) =>
      matchesStatus(menu.isActive, status) && includesTerm(search, menu.name, menu.route);
    return all.filter(
      (menu) =>
        match(menu) ||
        (!menu.parentId && all.some((child) => child.parentId === menu.id && match(child))),
    );
  });
  readonly kpis = computed(() => {
    const all = this.menus();
    return {
      main: String(all.filter((menu) => !menu.parentId).length),
      sub: String(all.filter((menu) => menu.parentId).length),
      inactive: String(all.filter((menu) => !menu.isActive).length),
    };
  });
  readonly isNew = computed(() => this.editing() === 'new');
  readonly current = computed(() => {
    const editing = this.editing();
    return editing && editing !== 'new' ? editing : null;
  });
  readonly hasChildren = computed(() => {
    const current = this.current();
    return !!current && this.menus().some((menu) => menu.parentId === current.id);
  });
  readonly parentOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Ninguno (menú principal)' },
    ...this.menus()
      .filter((menu) => !menu.parentId && menu.id !== this.current()?.id)
      .map((menu) => ({ value: menu.id, label: menu.name, sub: menu.route ?? 'Agrupa submenús' })),
  ]);
  readonly parentName = computed(
    () => this.menus().find((menu) => menu.id === this.form().parentId)?.name ?? '',
  );

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Cargando menús');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.menus().subscribe({
      next: (menus) => {
        this.menus.set(menus);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(apiErrorMessage(error, 'No pudimos cargar los menús.'));
      },
    });
  }

  icon(name: string): IconName {
    return name in ICONS ? (name as IconName) : 'circle';
  }

  childCount(menu: MenuItem): number {
    return this.menus().filter((child) => child.parentId === menu.id).length;
  }

  isProtected(menu: MenuItem): boolean {
    return PROTECTED.has(menu.code);
  }

  setDraft(changes: Partial<{ search: string; status: StatusFilter }>): void {
    this.draft.update((draft) => ({ ...draft, ...changes }));
  }

  search(): void {
    this.applied.set({ ...this.draft() });
  }

  clear(): void {
    this.draft.set({ search: '', status: '' });
    this.search();
  }

  // ——— Panel ———

  openNew(parent: MenuItem | null = null): void {
    const siblings = this.menus().filter((menu) => menu.parentId === (parent?.id ?? null));
    this.form.set({
      name: '',
      route: parent?.route ? `${parent.route}/` : '',
      icon: '',
      order: String(siblings.length + 1),
      parentId: parent?.id ?? '',
      isActive: true,
    });
    this.openDrawer('new');
  }

  openEdit(menu: MenuItem): void {
    this.form.set({
      name: menu.name,
      route: menu.route ?? '',
      icon: menu.icon,
      order: String(menu.order),
      parentId: menu.parentId ?? '',
      isActive: menu.isActive,
    });
    this.openDrawer(menu);
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  setField(key: Field, raw: string): void {
    const value =
      key === 'route'
        ? raw.toLowerCase().replace(/\s+/g, '-')
        : key === 'order'
          ? raw.replace(/\D/g, '').slice(0, 2)
          : raw;
    this.form.update((form) => ({ ...form, [key]: value }));
    if (this.showErrors()) this.errors.set(this.validate());
  }

  setActive(isActive: boolean): void {
    this.form.update((form) => ({ ...form, isActive }));
  }

  save(): void {
    if (this.saving()) return;
    const errors = this.validate();
    this.errors.set(errors);
    this.showErrors.set(true);
    if (Object.keys(errors).length) return;
    const current = this.current();
    const form = this.form();
    this.saveError.set('');
    this.saving.set(true);
    this.api
      .saveMenu(current?.id ?? null, {
        name: form.name.trim(),
        route: form.route.trim() || null,
        icon: form.icon,
        order: Number(form.order),
        parentId: form.parentId || null,
      })
      .subscribe({
        next: (saved) => {
          if (saved.isActive !== form.isActive) {
            this.api.setMenuStatus(saved.id, form.isActive).subscribe({
              next: () => this.saved(saved, !current),
              error: (error) => this.failed(error),
            });
          } else this.saved(saved, !current);
        },
        error: (error) => this.failed(error),
      });
  }

  // ——— Activar / desactivar ———

  confirmText(menu: MenuItem): string {
    return menu.isActive
      ? `La opción ${menu.name} dejará de mostrarse en el menú para todos los roles.`
      : `${menu.name} volverá a mostrarse para los roles que la tienen asignada.`;
  }

  toggleStatus(): void {
    const menu = this.confirming();
    if (!menu || this.toggling()) return;
    this.toggling.set(true);
    this.api.setMenuStatus(menu.id, !menu.isActive).subscribe({
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

  private saved(menu: MenuItem, created: boolean): void {
    this.saving.set(false);
    this.editing.set(null);
    this.toast.show(created ? `Opción ${menu.name} creada.` : `Opción ${menu.name} actualizada.`);
    this.menu.refresh();
    this.load();
  }

  private failed(error: unknown): void {
    this.saving.set(false);
    this.saveError.set(apiErrorMessage(error, 'No pudimos guardar la opción.'));
  }

  private openDrawer(target: MenuItem | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  private validate(): Partial<Record<Field, string>> {
    const form = this.form();
    const errors: Partial<Record<Field, string>> = {};
    const current = this.current();
    const route = form.route.trim();
    if (!form.name.trim()) errors.name = 'Ingresa el nombre.';
    if (!current?.isSystem) {
      if (!route && form.parentId) errors.route = 'Un submenú necesita una ruta.';
      else if (route && !/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(route))
        errors.route = 'Debe empezar con / y usar minúsculas, números o guiones.';
      else if (
        route &&
        this.menus().some((menu) => menu.id !== current?.id && menu.route === route)
      )
        errors.route = 'Esta ruta ya está asignada a otro menú.';
    }
    if (!form.icon) errors.icon = 'Elige un ícono.';
    const order = Number(form.order);
    if (!(order >= 1 && order <= 99)) errors.order = 'Ingresa un número entre 1 y 99.';
    if (form.parentId && this.hasChildren())
      errors.parentId = 'Tiene submenús: solo puede ser menú principal.';
    return errors;
  }
}

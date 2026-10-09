import { Injectable, computed, inject, signal } from '@angular/core';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { SelectOption } from '../../../../shared/ui/select/select-option';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { StatusFilter } from '../../../../shared/utils/status-filter';
import { matchesStatus, statusOptions } from '../../../../shared/utils/status-filter.util';
import { includesTerm } from '../../../../shared/utils/text-search.util';
import { CHANGE_MENU_STATUS, GET_MENUS, SAVE_MENU } from '../../di/menus.tokens';
import { MenuOption } from '../../domain/models/menu-option';
import {
  menuOrderError,
  menuRouteError,
  normalizeMenuOrder,
  normalizeMenuRoute,
} from '../../domain/rules/menu-rules';
import { MENU_ICONS } from '../catalog/menu-icons';
import { SessionMenuFacade } from './session-menu.facade';
import { MenuForm } from './menu-form';
import { MenuFormErrors } from './menu-form-errors';

const EMPTY_FORM: MenuForm = {
  name: '',
  route: '',
  icon: '',
  order: '1',
  parentId: '',
  isActive: true,
};

/** Estado de Configuración › Menús: listado jerárquico con filtros, panel de edición y activación. */
@Injectable()
export class MenuListFacade {
  private readonly getMenus = inject(GET_MENUS);
  private readonly saveMenu = inject(SAVE_MENU);
  private readonly changeStatus = inject(CHANGE_MENU_STATUS);
  private readonly sessionMenu = inject(SessionMenuFacade);
  private readonly toast = inject(ToastService);

  readonly statusOptions = statusOptions(false);
  readonly iconOptions: SelectOption[] = MENU_ICONS.map((icon) => ({
    value: icon.value,
    label: icon.label,
    sub: icon.value,
  }));

  readonly menus = signal<MenuOption[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal({ search: '', status: '' as StatusFilter });
  readonly applied = signal({ search: '', status: '' as StatusFilter });

  readonly editing = signal<MenuOption | 'new' | null>(null);
  readonly form = signal<MenuForm>(EMPTY_FORM);
  readonly errors = signal<MenuFormErrors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<MenuOption | null>(null);
  readonly toggling = signal(false);

  /** Un menú principal se muestra si coincide él o alguno de sus submenús. */
  readonly rows = computed(() => {
    const { search, status } = this.applied();
    const all = this.menus();
    const match = (menu: MenuOption) =>
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

  load(): void {
    this.loading.set(true);
    this.getMenus.execute().subscribe({
      next: (menus) => {
        this.menus.set(menus);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(userFacingMessage(error, 'No pudimos cargar los menús.'));
      },
    });
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

  openNew(parent: MenuOption | null = null): void {
    const siblings = this.menus().filter((menu) => menu.parentId === (parent?.id ?? null));
    this.form.set({
      ...EMPTY_FORM,
      route: parent?.route ? `${parent.route}/` : '',
      order: String(siblings.length + 1),
      parentId: parent?.id ?? '',
    });
    this.openDrawer('new');
  }

  openEdit(menu: MenuOption): void {
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

  setField(key: keyof MenuFormErrors, raw: string): void {
    const value =
      key === 'route' ? normalizeMenuRoute(raw) : key === 'order' ? normalizeMenuOrder(raw) : raw;
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
    this.saveMenu
      .execute(
        current?.id ?? null,
        {
          name: form.name.trim(),
          route: form.route.trim() || null,
          icon: form.icon,
          order: Number(form.order),
          parentId: form.parentId || null,
        },
        form.isActive,
      )
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.editing.set(null);
          this.toast.show(
            current ? `Opción ${saved.name} actualizada.` : `Opción ${saved.name} creada.`,
          );
          this.sessionMenu.refresh();
          this.load();
        },
        error: (error) => {
          this.saving.set(false);
          this.saveError.set(userFacingMessage(error, 'No pudimos guardar la opción.'));
        },
      });
  }

  // ——— Activar / desactivar ———

  confirmText(menu: MenuOption): string {
    return menu.isActive
      ? `La opción ${menu.name} dejará de mostrarse en el menú para todos los roles.`
      : `${menu.name} volverá a mostrarse para los roles que la tienen asignada.`;
  }

  toggleStatus(): void {
    const menu = this.confirming();
    if (!menu || this.toggling()) return;
    this.toggling.set(true);
    this.changeStatus.execute(menu.id, !menu.isActive).subscribe({
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

  private openDrawer(target: MenuOption | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  private validate(): MenuFormErrors {
    const form = this.form();
    const current = this.current();
    const errors: MenuFormErrors = {
      name: form.name.trim() ? undefined : 'Ingresa el nombre.',
      // Las opciones del sistema conservan su ruta.
      route: current?.isSystem
        ? undefined
        : menuRouteError(form.route.trim(), !!form.parentId, this.menus(), current?.id),
      icon: form.icon ? undefined : 'Elige un ícono.',
      order: menuOrderError(Number(form.order)),
      parentId:
        form.parentId && this.hasChildren()
          ? 'Tiene submenús: solo puede ser menú principal.'
          : undefined,
    };
    return Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as MenuFormErrors;
  }
}

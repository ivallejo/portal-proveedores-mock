import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../../core/layout/page-loading.service';
import { CatalogService } from '../../../shared/data/catalog.service';
import { apiErrorMessage } from '../../../core/http/api-error-message';
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
import { Area, AreaInput, Company, OrganizationService } from './organization.service';
import { StatusFilter, includesTerm, matchesStatus, statusOptions } from './status';

const PAGE_SIZE = 10;
type Errors = Partial<Record<keyof AreaInput, string>>;
interface Filters {
  search: string;
  status: StatusFilter;
  companyId: string;
}

/** Configuración › Áreas: unidades internas de cada sociedad. */
@Component({
  selector: 'app-areas-page',
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
  templateUrl: './areas-page.component.html',
})
export class AreasPageComponent {
  private readonly api = inject(OrganizationService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly statusOptions = statusOptions(true);
  readonly pageSize = PAGE_SIZE;

  readonly areas = signal<Area[]>([]);
  readonly companies = signal<Company[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal<Filters>({ search: '', status: '', companyId: '' });
  readonly applied = signal<Filters>({ search: '', status: '', companyId: '' });
  readonly page = signal(1);

  readonly editing = signal<Area | 'new' | null>(null);
  readonly form = signal<AreaInput>({ companyId: '', name: '', description: '' });
  readonly errors = signal<Errors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<Area | null>(null);
  readonly toggling = signal(false);

  readonly companyFilterOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Todas las sociedades' },
    ...this.companies().map((company) => ({
      value: company.id,
      label: company.name,
      sub: company.code,
    })),
  ]);
  /** En el formulario solo sociedades activas (más la actual si el área ya pertenece a una inactiva). */
  readonly companyFormOptions = computed<SelectOption[]>(() => {
    const editing = this.editing();
    const currentId = editing && editing !== 'new' ? editing.companyId : '';
    return this.companies()
      .filter((company) => company.isActive || company.id === currentId)
      .map((company) => ({
        value: company.id,
        label: company.name,
        sub: `${company.code} · RUC ${company.ruc ?? '—'}${company.isActive ? '' : ' · Inactiva'}`,
      }));
  });

  readonly rows = computed(() => {
    const { search, status, companyId } = this.applied();
    return this.areas().filter(
      (area) =>
        matchesStatus(area.isActive, status) &&
        (!companyId || area.companyId === companyId) &&
        includesTerm(search, area.name, area.description, area.companyName),
    );
  });
  readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const all = this.areas();
    const active = all.filter((area) => area.isActive).length;
    return {
      total: String(all.length),
      active: String(active),
      inactive: String(all.length - active),
    };
  });
  readonly isNew = computed(() => this.editing() === 'new');

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Cargando áreas');
    this.load();
    this.api.companies().subscribe({ next: (companies) => this.companies.set(companies) });
  }

  load(): void {
    this.loading.set(true);
    this.api.areas().subscribe({
      next: (areas) => {
        this.areas.set(areas);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(apiErrorMessage(error, 'No pudimos cargar las áreas.'));
      },
    });
  }

  setDraft(changes: Partial<Filters>): void {
    this.draft.update((draft) => ({ ...draft, ...changes }));
  }

  search(): void {
    this.applied.set({ ...this.draft() });
    this.page.set(1);
  }

  clear(): void {
    this.draft.set({ search: '', status: '', companyId: '' });
    this.search();
  }

  // ——— Panel de edición ———

  openNew(): void {
    this.form.set({ companyId: '', name: '', description: '' });
    this.openDrawer('new');
  }

  openEdit(area: Area): void {
    this.form.set({
      companyId: area.companyId,
      name: area.name,
      description: area.description ?? '',
    });
    this.openDrawer(area);
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  setField(key: keyof AreaInput, value: string): void {
    this.form.update((form) => ({ ...form, [key]: value }));
    if (this.showErrors()) this.errors.set(this.validate());
  }

  save(): void {
    const errors = this.validate();
    this.errors.set(errors);
    this.showErrors.set(true);
    if (Object.keys(errors).length) {
      this.saveError.set('Revisa los campos marcados.');
      return;
    }
    const editing = this.editing();
    const id = editing && editing !== 'new' ? editing.id : null;
    this.saveError.set('');
    this.saving.set(true);
    this.api.saveArea(id, this.form()).subscribe({
      next: (area) => {
        this.saving.set(false);
        this.editing.set(null);
        this.toast.show(id ? `Área ${area.name} actualizada` : `Área ${area.name} creada`);
        this.catalog.reload();
        this.load();
      },
      error: (error) => {
        this.saving.set(false);
        this.saveError.set(apiErrorMessage(error, 'No pudimos guardar el área.'));
      },
    });
  }

  // ——— Activar / desactivar ———

  confirmText(area: Area): string {
    return area.isActive
      ? `El área ${area.name} ya no podrá asignarse a nuevos usuarios. Los usuarios actuales conservan su asignación.`
      : `${area.name} volverá a estar disponible en el portal.`;
  }

  toggle(): void {
    const area = this.confirming();
    if (!area) return;
    this.toggling.set(true);
    this.api.setAreaStatus(area.id, !area.isActive).subscribe({
      next: (updated) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.areas.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
        this.toast.show(`Área ${updated.name} ${updated.isActive ? 'activada' : 'desactivada'}`);
        this.catalog.reload();
      },
      error: (error) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(apiErrorMessage(error, 'No pudimos cambiar el estado.'));
      },
    });
  }

  private openDrawer(target: Area | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  private validate(): Errors {
    const { companyId, name, description } = this.form();
    const errors: Errors = {};
    if (!companyId) errors.companyId = 'Selecciona la sociedad.';
    if (!name.trim()) errors.name = 'Ingresa el nombre del área.';
    if (description.length > 300) errors.description = 'Máximo 300 caracteres.';
    return errors;
  }
}

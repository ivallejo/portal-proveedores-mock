import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogFacade } from '../../../catalog';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { SelectOption } from '../../../../shared/ui/select/select-option';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { matchesStatus, statusOptions } from '../../../../shared/utils/status-filter.util';
import { includesTerm } from '../../../../shared/utils/text-search.util';
import { SaveAreaCommand } from '../../application/models/save-area.command';
import {
  CHANGE_AREA_STATUS,
  GET_AREAS,
  GET_AREA_SOCIETIES,
  SAVE_AREA,
} from '../../di/areas.tokens';
import { Area } from '../../domain/models/area';
import { AreaSociety } from '../../domain/models/area-society';
import {
  areaDescriptionError,
  areaNameError,
  areaSocietyError,
} from '../../domain/rules/area-rules';
import { AreaFilters } from './area-filters';
import { AreaFormErrors } from './area-form-errors';

const PAGE_SIZE = 10;
const NO_FILTERS: AreaFilters = { search: '', status: '', societyId: '' };
const EMPTY_FORM: SaveAreaCommand = { societyId: '', name: '', description: '' };

/** Estado de Configuración › Áreas: listado con filtros, panel de edición y activación. */
@Injectable()
export class AreaListFacade {
  private readonly getAreas = inject(GET_AREAS);
  private readonly getSocieties = inject(GET_AREA_SOCIETIES);
  private readonly saveArea = inject(SAVE_AREA);
  private readonly changeStatus = inject(CHANGE_AREA_STATUS);
  private readonly catalog = inject(CatalogFacade);
  private readonly toast = inject(ToastService);

  readonly statusOptions = statusOptions(true);
  readonly pageSize = PAGE_SIZE;

  readonly areas = signal<Area[]>([]);
  readonly societies = signal<AreaSociety[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal<AreaFilters>(NO_FILTERS);
  readonly applied = signal<AreaFilters>(NO_FILTERS);
  readonly page = signal(1);

  /** `null`: cerrado; `'new'`: nueva; o el área en edición. */
  readonly editing = signal<Area | 'new' | null>(null);
  readonly form = signal<SaveAreaCommand>(EMPTY_FORM);
  readonly errors = signal<AreaFormErrors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<Area | null>(null);
  readonly toggling = signal(false);

  readonly societyFilterOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Todas las sociedades' },
    ...this.societies().map((society) => ({
      value: society.id,
      label: society.name,
      sub: society.code,
    })),
  ]);
  /** En el formulario solo sociedades activas (más la actual si el área ya pertenece a una inactiva). */
  readonly societyFormOptions = computed<SelectOption[]>(() => {
    const editing = this.editing();
    const currentId = editing && editing !== 'new' ? editing.societyId : '';
    return this.societies()
      .filter((society) => society.isActive || society.id === currentId)
      .map((society) => ({
        value: society.id,
        label: society.name,
        sub: `${society.code} · RUC ${society.ruc ?? '—'}${society.isActive ? '' : ' · Inactiva'}`,
      }));
  });

  readonly rows = computed(() => {
    const { search, status, societyId } = this.applied();
    return this.areas().filter(
      (area) =>
        matchesStatus(area.isActive, status) &&
        (!societyId || area.societyId === societyId) &&
        includesTerm(search, area.name, area.description, area.societyName),
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

  load(): void {
    this.loading.set(true);
    this.getAreas.execute().subscribe({
      next: (areas) => {
        this.areas.set(areas);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(userFacingMessage(error, 'No pudimos cargar las áreas.'));
      },
    });
  }

  loadSocieties(): void {
    this.getSocieties.execute().subscribe({ next: (societies) => this.societies.set(societies) });
  }

  setDraft(changes: Partial<AreaFilters>): void {
    this.draft.update((draft) => ({ ...draft, ...changes }));
  }

  search(): void {
    this.applied.set({ ...this.draft() });
    this.page.set(1);
  }

  clear(): void {
    this.draft.set(NO_FILTERS);
    this.search();
  }

  // ——— Panel de edición ———

  openNew(): void {
    this.form.set(EMPTY_FORM);
    this.openDrawer('new');
  }

  openEdit(area: Area): void {
    this.form.set({
      societyId: area.societyId,
      name: area.name,
      description: area.description ?? '',
    });
    this.openDrawer(area);
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  setField(key: keyof SaveAreaCommand, value: string): void {
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
    this.saveArea.execute(id, this.form()).subscribe({
      next: (area) => {
        this.saving.set(false);
        this.editing.set(null);
        this.toast.show(id ? `Área ${area.name} actualizada` : `Área ${area.name} creada`);
        this.catalog.reload();
        this.load();
      },
      error: (error) => {
        this.saving.set(false);
        this.saveError.set(userFacingMessage(error, 'No pudimos guardar el área.'));
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
    this.changeStatus.execute(area.id, !area.isActive).subscribe({
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
        this.toast.show(userFacingMessage(error, 'No pudimos cambiar el estado.'));
      },
    });
  }

  private openDrawer(target: Area | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  private validate(): AreaFormErrors {
    const { societyId, name, description } = this.form();
    const errors: AreaFormErrors = {
      societyId: areaSocietyError(societyId),
      name: areaNameError(name),
      description: areaDescriptionError(description),
    };
    return Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as AreaFormErrors;
  }
}

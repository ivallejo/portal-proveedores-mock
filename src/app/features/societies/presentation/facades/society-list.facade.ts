import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogFacade } from '../../../catalog';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { StatusFilter } from '../../../../shared/utils/status-filter';
import { matchesStatus, statusOptions } from '../../../../shared/utils/status-filter.util';
import { includesTerm } from '../../../../shared/utils/text-search.util';
import { SaveSocietyCommand } from '../../application/models/save-society.command';
import { CHANGE_SOCIETY_STATUS, GET_SOCIETIES, SAVE_SOCIETY } from '../../di/societies.tokens';
import { Society } from '../../domain/models/society';
import {
  billingEmailError,
  normalizeSocietyCode,
  normalizeSocietyRuc,
  societyCodeError,
  societyNameError,
  societyRucError,
} from '../../domain/rules/society-rules';
import { SocietyFormErrors } from './society-form-errors';

const PAGE_SIZE = 10;
const EMPTY_FORM: SaveSocietyCommand = { code: '', name: '', ruc: '', billingEmail: '' };

/** Estado de Configuración › Sociedades: listado con filtros, panel de edición y activación. */
@Injectable()
export class SocietyListFacade {
  private readonly getSocieties = inject(GET_SOCIETIES);
  private readonly saveSociety = inject(SAVE_SOCIETY);
  private readonly changeStatus = inject(CHANGE_SOCIETY_STATUS);
  private readonly catalog = inject(CatalogFacade);
  private readonly toast = inject(ToastService);

  readonly statusOptions = statusOptions(true);
  readonly pageSize = PAGE_SIZE;

  readonly societies = signal<Society[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal({ search: '', status: '' as StatusFilter });
  readonly applied = signal({ search: '', status: '' as StatusFilter });
  readonly page = signal(1);

  /** `null`: cerrado; `'new'`: nueva; o la sociedad en edición. */
  readonly editing = signal<Society | 'new' | null>(null);
  readonly form = signal<SaveSocietyCommand>(EMPTY_FORM);
  readonly errors = signal<SocietyFormErrors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<Society | null>(null);
  readonly toggling = signal(false);

  readonly rows = computed(() => {
    const { search, status } = this.applied();
    return this.societies().filter(
      (society) =>
        matchesStatus(society.isActive, status) &&
        includesTerm(search, society.code, society.name, society.ruc),
    );
  });
  readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const all = this.societies();
    const active = all.filter((society) => society.isActive).length;
    return {
      total: String(all.length),
      active: String(active),
      inactive: String(all.length - active),
    };
  });
  readonly isNew = computed(() => this.editing() === 'new');

  load(): void {
    this.loading.set(true);
    this.getSocieties.execute().subscribe({
      next: (societies) => {
        this.societies.set(societies);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(userFacingMessage(error, 'No pudimos cargar las sociedades.'));
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

  // ——— Panel de edición ———

  openNew(): void {
    this.form.set(EMPTY_FORM);
    this.openDrawer('new');
  }

  openEdit(society: Society): void {
    this.form.set({
      code: society.code,
      name: society.name,
      ruc: society.ruc ?? '',
      billingEmail: society.billingEmail ?? '',
    });
    this.openDrawer(society);
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  setField(key: keyof SaveSocietyCommand, raw: string): void {
    const value =
      key === 'code' ? normalizeSocietyCode(raw) : key === 'ruc' ? normalizeSocietyRuc(raw) : raw;
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
    this.saveSociety.execute(id, this.form()).subscribe({
      next: (society) => {
        this.saving.set(false);
        this.editing.set(null);
        this.toast.show(
          id ? `Sociedad ${society.code} actualizada` : `Sociedad ${society.code} creada`,
        );
        this.catalog.reload();
        this.load();
      },
      error: (error) => {
        this.saving.set(false);
        this.saveError.set(userFacingMessage(error, 'No pudimos guardar la sociedad.'));
      },
    });
  }

  // ——— Activar / desactivar ———

  askToggle(society: Society): void {
    this.confirming.set(society);
  }

  confirmText(society: Society): string {
    return society.isActive
      ? `${society.name} dejará de aparecer en los filtros y los usuarios no podrán registrar documentos para ella. Sus ${society.areaCount} áreas y el historial se conservan.`
      : `${society.name} volverá a estar disponible en el portal.`;
  }

  toggle(): void {
    const society = this.confirming();
    if (!society) return;
    this.toggling.set(true);
    this.changeStatus.execute(society.id, !society.isActive).subscribe({
      next: (updated) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.societies.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.toast.show(
          `Sociedad ${updated.code} ${updated.isActive ? 'activada' : 'desactivada'}`,
        );
        this.catalog.reload();
      },
      error: (error) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(userFacingMessage(error, 'No pudimos cambiar el estado.'));
      },
    });
  }

  private openDrawer(target: Society | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  /** Las mismas reglas del backend, para avisar antes de enviar. */
  private validate(): SocietyFormErrors {
    const { code, name, ruc, billingEmail } = this.form();
    const errors: SocietyFormErrors = {
      code: societyCodeError(code),
      name: societyNameError(name),
      ruc: societyRucError(ruc),
      billingEmail: billingEmailError(billingEmail),
    };
    return Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as SocietyFormErrors;
  }
}

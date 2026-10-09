import { Injectable, computed, inject, signal } from '@angular/core';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { SelectOption } from '../../../../shared/ui/select/select-option';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { UserFilter } from '../../application/models/user-filter';
import { CHANGE_USER_STATUS, GET_USER_CATALOG, SEARCH_USERS } from '../../di/users.tokens';
import { UserCatalog } from '../../domain/models/user-catalog';
import { UserCounts } from '../../domain/models/user-counts';
import { UserSummary } from '../../domain/models/user-summary';
import { userToggleVerb } from '../catalog/user-toggle-verb.util';

const PAGE_SIZE = 10;
const NO_FILTER: UserFilter = { search: '', role: '', status: '' };

/** Listado de Configuración › Usuarios: filtros, paginación del servidor, catálogo y activación. */
@Injectable()
export class UserListFacade {
  private readonly searchUsers = inject(SEARCH_USERS);
  private readonly getCatalog = inject(GET_USER_CATALOG);
  private readonly changeStatus = inject(CHANGE_USER_STATUS);
  private readonly toast = inject(ToastService);

  readonly pageSize = PAGE_SIZE;
  readonly statusFilterOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'locked', label: 'Bloqueados' },
  ];

  readonly catalog = signal<UserCatalog>({ roles: [], areas: [], companies: [] });
  readonly rows = signal<UserSummary[]>([]);
  readonly total = signal(0);
  readonly counts = signal<UserCounts | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal<UserFilter>(NO_FILTER);
  readonly applied = signal<UserFilter>(NO_FILTER);
  readonly page = signal(1);

  readonly confirming = signal<UserSummary | null>(null);
  readonly toggling = signal(false);

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

  loadCatalog(): void {
    this.getCatalog.execute().subscribe({ next: (catalog) => this.catalog.set(catalog) });
  }

  load(): void {
    this.loading.set(true);
    this.searchUsers.execute(this.applied(), this.page(), PAGE_SIZE).subscribe({
      next: (result) => {
        this.rows.set(result.items);
        this.total.set(result.total);
        this.counts.set(result.counts);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(userFacingMessage(error, 'No pudimos cargar los usuarios.'));
      },
    });
  }

  roleName(code: string | null): string {
    return this.catalog().roles.find((role) => role.code === code)?.name ?? '—';
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
    this.draft.set(NO_FILTER);
    this.search();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  // ——— Activar / desactivar / desbloquear ———

  askToggle(row: UserSummary): void {
    this.confirming.set(row);
  }

  toggleVerb(row: UserSummary): string {
    return userToggleVerb(row);
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
    this.changeStatus.execute(row.id, activate).subscribe({
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
        this.toast.show(userFacingMessage(error, 'No pudimos cambiar el estado.'), 4000);
      },
    });
  }
}
